import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json([], { status: 200 });
    const propertyIds = pSnap.docs.map(doc => doc.id);
    const propertiesMap = Object.fromEntries(pSnap.docs.map(doc => [doc.id, doc.data()]));

    const { searchParams } = new URL(req.url);
    const propertyIdParam = searchParams.get("propertyId");

    let targets = propertyIds;
    if (propertyIdParam && propertyIdParam !== "all") {
      if (!propertyIds.includes(propertyIdParam)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targets = [propertyIdParam];
    }

    const allPayments: any[] = [];

    await Promise.all(
      targets.map(async (pId) => {
        const paySnap = await adminDb.collection("properties").doc(pId).collection("payments").get();
        const tSnap = await adminDb.collection("properties").doc(pId).collection("tenants").get();
        
        const tenantsMap: Record<string, any> = {};
        tSnap.docs.forEach((tDoc) => {
          tenantsMap[tDoc.id] = { id: tDoc.id, ...tDoc.data() };
        });

        paySnap.docs.forEach((payDoc) => {
          const payData = payDoc.data();
          const tenantData = payData.tenantId ? (tenantsMap[payData.tenantId] || null) : null;
          allPayments.push({
            id: payDoc.id,
            ...payData,
            tenant: tenantData,
            propertyId: pId,
            propertyName: propertiesMap[pId]?.name || "My PG"
          });
        });
      })
    );

    // Sort descending by created_at approx
    allPayments.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(allPayments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    const body = await req.json();
    const { tenantId, type, amount, amount_paid, method, propertyId } = body;

    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      targetPropertyId = pSnap.docs[0].id;
    } else if (!propertyIds.includes(targetPropertyId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const paymentsRef = adminDb.collection("properties").doc(targetPropertyId).collection("payments");
    
    const newPayment = {
      tenantId,
      type,
      amount: parseFloat(amount),
      amount_paid: parseFloat(amount_paid),
      method,
      payment_date: new Date(),
      status: parseFloat(amount_paid) >= parseFloat(amount) ? "paid" : "partial",
      created_at: new Date()
    };
    
    const newPayRef = await paymentsRef.add(newPayment);

    return NextResponse.json({ id: newPayRef.id, ...newPayment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

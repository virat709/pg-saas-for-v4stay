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

    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyId = pSnap.docs[0].id;

    const paymentsRef = adminDb.collection("properties").doc(propertyId).collection("payments");
    const paySnap = await paymentsRef.get();
    
    // Fetch all tenants once to map them in memory
    const tSnap = await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("tenants")
      .get();
    
    const tenantsMap: Record<string, any> = {};
    tSnap.docs.forEach((tDoc) => {
      tenantsMap[tDoc.id] = { id: tDoc.id, ...tDoc.data() };
    });

    const payments = paySnap.docs.map((payDoc) => {
      const payData = payDoc.data();
      const tenantData = payData.tenantId ? (tenantsMap[payData.tenantId] || null) : null;
      return {
        id: payDoc.id,
        ...payData,
        tenant: tenantData,
      };
    });

    // Sort descending by created_at approx
    payments.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(payments);
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
    const propertyId = pSnap.docs[0].id;

    const body = await req.json();
    const { tenantId, type, amount, amount_paid, method } = body;

    const paymentsRef = adminDb.collection("properties").doc(propertyId).collection("payments");
    
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

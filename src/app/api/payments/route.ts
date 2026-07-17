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
    const monthParam = searchParams.get("month"); // "YYYY-MM"

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
          
          if (monthParam) {
            const rawDate = payData.payment_date || payData.created_at;
            const pDate = rawDate?.toDate ? rawDate.toDate() : (rawDate ? new Date(rawDate) : null);
            if (pDate && !isNaN(pDate.getTime())) {
              const year = pDate.getFullYear();
              const month = String(pDate.getMonth() + 1).padStart(2, "0");
              const yyyymm = `${year}-${month}`;
              if (yyyymm !== monthParam) return;
            } else {
              return;
            }
          }

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

    return NextResponse.json(allPayments, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
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
    const { tenantId, type, amount, amount_paid, method, propertyId, payment_date, reference, payer_name } = body;

    // Require propertyId — don't silently fall back to first property
    if (!propertyId) return NextResponse.json({ message: "propertyId is required" }, { status: 400 });
    if (!propertyIds.includes(propertyId)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Validate amounts
    const parsedAmount = parseFloat(amount);
    const parsedAmountPaid = parseFloat(amount_paid);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    if (isNaN(parsedAmountPaid) || parsedAmountPaid < 0) return NextResponse.json({ message: "Invalid amount_paid" }, { status: 400 });

    // Verify tenantId belongs to this property
    if (tenantId) {
      const tDoc = await adminDb.collection("properties").doc(propertyId).collection("tenants").doc(tenantId).get();
      if (!tDoc.exists) return NextResponse.json({ message: "Tenant not found in this property" }, { status: 404 });
    }

    const paymentsRef = adminDb.collection("properties").doc(propertyId).collection("payments");

    const newPayment = {
      tenantId: tenantId || null,
      type: type || "rent",
      amount: parsedAmount,
      amount_paid: parsedAmountPaid,
      method: method || "cash",
      payment_date: payment_date ? new Date(payment_date) : new Date(),
      status: parsedAmountPaid >= parsedAmount ? "paid" : "partial",
      created_at: new Date(),
      reference: reference || "",
      payer_name: payer_name || ""
    };

    const newPayRef = await paymentsRef.add(newPayment);
    return NextResponse.json({ id: newPayRef.id, ...newPayment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    const body = await req.json();
    const { paymentId, status, propertyId } = body;

    if (!paymentId || !status) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

    // Whitelist allowed statuses
    const ALLOWED = ["paid", "partial", "pending", "failed"];
    if (!ALLOWED.includes(status)) return NextResponse.json({ message: `Invalid status. Allowed: ${ALLOWED.join(", ")}` }, { status: 400 });

    if (!propertyId) return NextResponse.json({ message: "propertyId is required" }, { status: 400 });
    if (!propertyIds.includes(propertyId)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("payments")
      .doc(paymentId)
      .update({ status, updated_at: new Date() });

    return NextResponse.json({ message: "Payment updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

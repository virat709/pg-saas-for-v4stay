import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { amount, method, reference } = body;

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    // Secure by obscurity (UUID is hard to guess). Find the property ID for this tenant.
    const propertiesRef = adminDb.collection("properties");
    const pSnap = await propertiesRef.get();
    
    let propertyId = null;
    let tenantStatus = null;

    for (const p of pSnap.docs) {
      const tRef = adminDb.collection("properties").doc(p.id).collection("tenants").doc(tenantId);
      const tDoc = await tRef.get();
      if (tDoc.exists) {
        propertyId = p.id;
        tenantStatus = tDoc.data()?.status;
        break;
      }
    }

    if (!propertyId) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    if (tenantStatus === "vacated") return NextResponse.json({ message: "Account deactivated" }, { status: 403 });

    const paymentsRef = adminDb.collection("properties").doc(propertyId).collection("payments");
    
    const newPayment = {
      tenantId,
      type: "rent",
      amount: parseFloat(amount),
      amount_paid: parseFloat(amount),
      method: method || "online",
      reference: reference || null,
      payment_date: new Date(),
      status: "completed", // Assumes fully paid upon proof submission
      created_at: new Date()
    };
    
    const newPayRef = await paymentsRef.add(newPayment);

    return NextResponse.json({ id: newPayRef.id, ...newPayment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

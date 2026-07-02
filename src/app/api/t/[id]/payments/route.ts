import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getTenantAndProperty } from "@/lib/tenantHelper";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { amount, method, reference } = body;

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const result = await getTenantAndProperty(tenantId);
    if (!result) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    
    const { propertyId, tenantDoc } = result;
    const tenantStatus = tenantDoc.data()?.status;
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
      status: "pending", // Tenant-submitted payments require admin confirmation
      created_at: new Date()
    };
    
    const newPayRef = await paymentsRef.add(newPayment);

    await adminDb.collection("notifications").add({
      title: "New Payment Submitted",
      message: `Tenant has submitted a payment of ₹${amount}.`,
      read: false,
      recipientRole: "admin",
      propertyId: propertyId,
      created_at: new Date(),
      type: "payment"
    });

    return NextResponse.json({ id: newPayRef.id, ...newPayment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

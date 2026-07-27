import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;
    const body = await req.json();
    const { propertyId, deposit_collected, pending_rent_deduction, damage_deduction, final_refund_amount, note } = body;

    if (!propertyId) return NextResponse.json({ message: "Property ID required" }, { status: 400 });

    // Verify owner owns property
    const pDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!pDoc.exists || pDoc.data()?.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const tenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc(tenantId);
    const tenantSnap = await tenantRef.get();
    if (!tenantSnap.exists) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    const tenantData = tenantSnap.data()!;
    const roomId = tenantData.roomId;
    const bedId = tenantData.bedId;

    const parsedDeposit = Number(deposit_collected) || 0;
    const parsedRentDeduction = Number(pending_rent_deduction) || 0;
    const parsedDamageDeduction = Number(damage_deduction) || 0;
    const parsedRefund = Number(final_refund_amount) || 0;

    const batch = adminDb.batch();

    // 1. Mark tenant as vacated
    batch.update(tenantRef, {
      status: "vacated",
      date_vacated: new Date().toISOString().split("T")[0],
      updated_at: new Date(),
    });

    // 2. Free up assigned bed
    if (roomId && bedId) {
      const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(roomId).collection("beds").doc(bedId);
      const bedSnap = await bedRef.get();
      if (bedSnap.exists) {
        batch.update(bedRef, {
          status: "vacant",
          tenantId: null,
          updated_at: new Date(),
        });
      }
    }

    // 3. Record checkout settlement
    const settlementRef = adminDb.collection("properties").doc(propertyId).collection("settlements").doc();
    batch.set(settlementRef, {
      tenantId,
      tenantName: tenantData.name,
      tenantPhone: tenantData.phone,
      deposit_collected: parsedDeposit,
      pending_rent_deduction: parsedRentDeduction,
      damage_deduction: parsedDamageDeduction,
      final_refund_amount: parsedRefund,
      note: note || "Checkout settlement completed",
      settled_at: new Date(),
    });

    // 4. Add deposit ledger record
    const ledgerRef = tenantRef.collection("depositLedger").doc();
    batch.set(ledgerRef, {
      type: "returned",
      amount: parsedRefund,
      note: `Final refund at checkout (Deductions: Rent ₹${parsedRentDeduction}, Damages ₹${parsedDamageDeduction})`,
      date: new Date().toISOString().split("T")[0],
      created_at: new Date(),
    });

    await batch.commit();

    return NextResponse.json({
      settlementId: settlementRef.id,
      message: `Tenant "${tenantData.name}" checked out successfully. Refundable deposit: ₹${parsedRefund}`,
    });
  } catch (error) {
    console.error("[Settlement POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

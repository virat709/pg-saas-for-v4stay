import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebaseAdmin";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();

    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyId = pSnap.docs[0].id;

    const tenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc(tenantId);
    const tenantSnap = await tenantRef.get();

    if (!tenantSnap.exists) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    const tenantData = tenantSnap.data()!;

    if (tenantData.status === "vacated") {
      return NextResponse.json({ message: "Tenant is already vacated" }, { status: 400 });
    }

    const batch = adminDb.batch();

    // 1. Update Tenant to vacated, remove bedId
    batch.update(tenantRef, {
      status: "vacated",
      vacated_date: new Date(),
      bedId: null,
      roomId: null,
      updated_at: new Date()
    });

    // 2. If tenant had a bed, free up the bed
    if (tenantData.bedId && tenantData.roomId) {
      const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tenantData.roomId).collection("beds").doc(tenantData.bedId);
      batch.update(bedRef, {
        status: "vacant",
        tenantId: null,
        updated_at: new Date()
      });
    }

    await batch.commit();

    return NextResponse.json({ message: "Tenant vacated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error vacating tenant:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

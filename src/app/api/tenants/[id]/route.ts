import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;
    const body = await req.json();
    
    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyId = pSnap.docs[0].id;

    const tenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc(tenantId);
    
    await tenantRef.update({
      name: body.name,
      phone: body.phone,
      rent_amount: Number(body.rent_amount),
      billing_cycle_day: Number(body.billing_cycle_day),
      updated_at: new Date()
    });

    return NextResponse.json({ message: "Tenant updated successfully" });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;
    const url = new URL(req.url);
    const isHardDelete = url.searchParams.get("hard") === "true";

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();

    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyId = pSnap.docs[0].id;

    const tenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc(tenantId);
    const tenantSnap = await tenantRef.get();

    if (!tenantSnap.exists) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    const tenantData = tenantSnap.data()!;

    const batch = adminDb.batch();

    // If tenant had a bed, free up the bed
    if (tenantData.bedId && tenantData.roomId) {
      const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tenantData.roomId).collection("beds").doc(tenantData.bedId);
      batch.update(bedRef, {
        status: "vacant",
        tenantId: null,
        updated_at: new Date()
      });
    }

    if (isHardDelete) {
      // Completely remove the tenant record
      batch.delete(tenantRef);
    } else {
      if (tenantData.status === "vacated") {
        return NextResponse.json({ message: "Tenant is already vacated" }, { status: 400 });
      }
      // Update Tenant to vacated, remove bedId
      batch.update(tenantRef, {
        status: "vacated",
        vacated_date: new Date(),
        bedId: null,
        roomId: null,
        updated_at: new Date()
      });
    }

    await batch.commit();

    return NextResponse.json({ message: isHardDelete ? "Tenant deleted successfully" : "Tenant vacated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error modifying tenant:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


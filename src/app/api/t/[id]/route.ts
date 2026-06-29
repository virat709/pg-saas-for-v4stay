import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;

    // Single collectionGroup query — no N+1 property scan
    const { FieldPath } = await import("firebase-admin/firestore");
    const tSnap = await adminDb.collectionGroup("tenants").where(FieldPath.documentId(), "==", tenantId).get();

    if (tSnap.empty) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const tenantSnap = tSnap.docs[0];
    const propertyId = tenantSnap.ref.path.split("/")[1];
    const tenantData = tenantSnap.data();
    if (!tenantData) return NextResponse.json({ message: "Tenant data missing" }, { status: 404 });

    // Block access for vacated tenants
    if (tenantData.status === "vacated") {
      return NextResponse.json({ message: "This tenant account has been deactivated. Please contact your PG owner." }, { status: 403 });
    }

    // Fetch all related data in parallel
    const [pSnap, paySnap, cSnap] = await Promise.all([
      adminDb.collection("properties").doc(propertyId).get(),
      adminDb.collection("properties").doc(propertyId).collection("payments").where("tenantId", "==", tenantId).get(),
      adminDb.collection("properties").doc(propertyId).collection("maintenanceRequests").where("tenantId", "==", tenantId).get(),
    ]);

    const propertyData = pSnap.exists ? { id: propertyId, ...pSnap.data() } : null;

    // Fetch bed/room (only if tenant has an assignment)
    let bedData = null;
    if (tenantData.roomId && tenantData.bedId) {
      const roomRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tenantData.roomId);
      const [rSnap, bSnap] = await Promise.all([
        roomRef.get(),
        roomRef.collection("beds").doc(tenantData.bedId).get(),
      ]);
      if (bSnap.exists) {
        bedData = { id: bSnap.id, ...bSnap.data(), room: rSnap.exists ? { id: rSnap.id, ...rSnap.data() } : null };
      }
    }

    const payments = paySnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    const maintenanceRequests = cSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    const tenant = {
      id: tenantSnap.id,
      ...tenantData,
      property: propertyData,
      bed: bedData,
      payments,
      maintenanceRequests
    };

    return NextResponse.json(tenant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

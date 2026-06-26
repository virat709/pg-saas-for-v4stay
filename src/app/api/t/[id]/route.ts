import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;

    // Fetch tenant using collectionGroup and query by documentId to avoid sequential property iteration
    const { FieldPath } = await import("firebase-admin/firestore");
    const tSnap = await adminDb.collectionGroup("tenants").where(FieldPath.documentId(), "==", tenantId).get();
    
    if (tSnap.empty) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    const tenantSnap = tSnap.docs[0];
    const path = tenantSnap.ref.path;
    const parts = path.split("/");
    const propertyId = parts[1];

    const pSnap = await adminDb.collection("properties").doc(propertyId).get();
    const propertyData = pSnap.exists ? { id: propertyId, ...pSnap.data() } : null;

    const tenantData = tenantSnap.data();
    if (!tenantData) return NextResponse.json({ message: "Tenant data missing" }, { status: 404 });

    // Block access for vacated tenants — portal is permanently disabled
    if (tenantData.status === "vacated") {
      return NextResponse.json({ message: "This tenant account has been deactivated. Please contact your PG owner." }, { status: 403 });
    }
    // Fetch bed/room
    let bedData = null;
    if (tenantData.roomId && tenantData.bedId) {
      const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tenantData.roomId).collection("beds").doc(tenantData.bedId);
      const bSnap = await bedRef.get();
      if (bSnap.exists) {
        const roomRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tenantData.roomId);
        const rSnap = await roomRef.get();
        bedData = { id: bSnap.id, ...bSnap.data(), room: rSnap.exists ? { id: rSnap.id, ...rSnap.data() } : null };
      }
    }

    // Fetch payments
    const paymentsRef = adminDb.collection("properties").doc(propertyId).collection("payments");
    const paySnap = await paymentsRef.where("tenantId", "==", tenantId).get();
    const payments = paySnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    // Fetch complaints
    const complaintsRef = adminDb.collection("properties").doc(propertyId).collection("maintenanceRequests");
    const cSnap = await complaintsRef.where("tenantId", "==", tenantId).get();
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

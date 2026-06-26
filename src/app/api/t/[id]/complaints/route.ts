import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { category, description } = body;

    // Fetch tenant using collectionGroup and query by documentId to avoid sequential property iteration
    const { FieldPath } = await import("firebase-admin/firestore");
    const tSnap = await adminDb.collectionGroup("tenants").where(FieldPath.documentId(), "==", tenantId).get();
    
    if (tSnap.empty) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    const tenantDoc = tSnap.docs[0];
    const path = tenantDoc.ref.path;
    const propertyId = path.split("/")[1];
    const tenantStatus = tenantDoc.data()?.status;
    if (tenantStatus === "vacated") return NextResponse.json({ message: "Account deactivated" }, { status: 403 });

    const complaintsRef = adminDb.collection("properties").doc(propertyId).collection("maintenanceRequests");
    const complaintRef = await complaintsRef.add({
      tenantId,
      category,
      description,
      status: "open",
      created_at: new Date(),
      updated_at: new Date()
    });

    return NextResponse.json({ id: complaintRef.id, category, description, status: "open" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

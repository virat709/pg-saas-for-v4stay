import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    if (!tenantId) return NextResponse.json({ message: "Tenant ID required" }, { status: 400 });

    // Single collectionGroup query — no N+1 property scan
    const { FieldPath } = await import("firebase-admin/firestore");
    const tSnap = await adminDb.collectionGroup("tenants").where(FieldPath.documentId(), "==", tenantId).get();

    if (tSnap.empty) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const tenantDoc = tSnap.docs[0];
    const propertyId = tenantDoc.ref.path.split("/")[1];
    const tenantData = tenantDoc.data();
    if (tenantData?.status === "vacated") {
      return NextResponse.json({ message: "Account deactivated" }, { status: 403 });
    }

    // Fetch notices for this property
    const nSnap = await adminDb.collection("properties").doc(propertyId).collection("notices").orderBy("created_at", "desc").get();
    
    const notices = nSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(notices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

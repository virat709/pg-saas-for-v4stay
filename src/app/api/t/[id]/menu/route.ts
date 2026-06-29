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

    const tenantDoc = tSnap.docs[0];
    const propertyId = tenantDoc.ref.path.split("/")[1];
    const isTenantVacated = tenantDoc.data()?.status === "vacated";
    if (isTenantVacated) return NextResponse.json({ message: "Account deactivated" }, { status: 403 });

    const menuDoc = await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("menu")
      .doc("week")
      .get();

    if (!menuDoc.exists) return NextResponse.json(null);

    const data = menuDoc.data() as Record<string, any>;
    const { updatedAt, ...menu } = data;
    return NextResponse.json(menu);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

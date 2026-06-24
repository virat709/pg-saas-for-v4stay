import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;

    // Find which property this tenant belongs to
    const propertiesRef = adminDb.collection("properties");
    const pSnap = await propertiesRef.get();

    let propertyId: string | null = null;
    let isTenantVacated = false;

    for (const p of pSnap.docs) {
      const tRef = adminDb.collection("properties").doc(p.id).collection("tenants").doc(tenantId);
      const tDoc = await tRef.get();
      if (tDoc.exists) {
        propertyId = p.id;
        isTenantVacated = tDoc.data()?.status === "vacated";
        break;
      }
    }

    if (!propertyId) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
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

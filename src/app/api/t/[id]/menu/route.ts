import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;

    // Iterate through properties to find the tenant
    const pSnapList = await adminDb.collection("properties").get();
    let propertyId = null;
    let tenantDoc = null;

    for (const doc of pSnapList.docs) {
      const tDoc = await doc.ref.collection("tenants").doc(tenantId).get();
      if (tDoc.exists) {
        propertyId = doc.id;
        tenantDoc = tDoc;
        break;
      }
    }

    if (!propertyId || !tenantDoc) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }
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

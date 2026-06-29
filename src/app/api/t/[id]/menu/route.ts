import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getTenantAndProperty } from "@/lib/tenantHelper";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;

    const result = await getTenantAndProperty(tenantId);
    if (!result) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const { propertyId, tenantDoc } = result;
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

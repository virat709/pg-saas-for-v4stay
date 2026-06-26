import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { category, description } = body;

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

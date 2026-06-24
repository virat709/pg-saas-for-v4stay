import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { category, description } = body;

    const propertiesRef = adminDb.collection("properties");
    const pSnap = await propertiesRef.get();
    
    let propertyId = null;
    let tenantStatus = null;

    for (const p of pSnap.docs) {
      const tRef = adminDb.collection("properties").doc(p.id).collection("tenants").doc(tenantId);
      const tDoc = await tRef.get();
      if (tDoc.exists) {
        propertyId = p.id;
        tenantStatus = tDoc.data()?.status;
        break;
      }
    }

    if (!propertyId) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
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

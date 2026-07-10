import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getTenantAndProperty } from "@/lib/tenantHelper";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { category, description } = body;

    const result = await getTenantAndProperty(tenantId);
    if (!result) {
      return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    }

    const { propertyId, tenantDoc } = result;
    const tenantStatus = tenantDoc.data()?.status;
    if (tenantStatus === "vacated") return NextResponse.json({ message: "Account deactivated" }, { status: 403 });

    const tenantName = tenantDoc.data()?.name || "A tenant";

    const complaintsRef = adminDb.collection("properties").doc(propertyId).collection("maintenanceRequests");
    const complaintRef = await complaintsRef.add({
      tenantId,
      category,
      description,
      status: "open",
      created_at: new Date(),
      updated_at: new Date()
    });

    await adminDb.collection("notifications").add({
      title: "New Complaint Submitted",
      message: `${tenantName} submitted a new complaint: ${category}.`,
      read: false,
      recipientRole: "admin",
      propertyId: propertyId,
      tenantId,
      created_at: new Date(),
      type: "complaint"
    });

    return NextResponse.json({ id: complaintRef.id, category, description, status: "open" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

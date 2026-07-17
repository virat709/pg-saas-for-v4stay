import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getTenantAndProperty } from "@/lib/tenantHelper";

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { category, description } = body;

    const ALLOWED_CATEGORIES = ["plumbing", "electrical", "cleanliness", "noise", "appliance", "security", "other"];
    if (!category || !ALLOWED_CATEGORIES.includes(category))
      return NextResponse.json({ message: "Invalid category" }, { status: 400 });
    const cleanDesc = (description || "").trim().slice(0, 500);
    if (!cleanDesc)
      return NextResponse.json({ message: "Description is required" }, { status: 400 });

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
      description: cleanDesc,
      status: "open",
      created_at: new Date(),
      updated_at: new Date()
    });

    const propertyDoc = await adminDb.collection("properties").doc(propertyId).get();
    const ownerId = propertyDoc.data()?.ownerId || null;

    await adminDb.collection("notifications").add({
      title: "New Complaint Submitted",
      message: `${tenantName} submitted a new complaint: ${category}.`,
      read: false,
      recipientRole: "admin",
      propertyId: propertyId,
      ownerId,
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

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// GET property details for public self-registration page
export async function GET(
  req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    if (!propertyId) return NextResponse.json({ message: "Property ID required" }, { status: 400 });

    const pDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!pDoc.exists) return NextResponse.json({ message: "Property not found" }, { status: 404 });

    const pData = pDoc.data();

    // Check owner subscription status
    const ownerId = pData?.ownerId;
    if (ownerId) {
      const ownerDoc = await adminDb.collection("owners").doc(ownerId).get();
      if (ownerDoc.exists && ownerDoc.data()?.subscription_status !== "active") {
        return NextResponse.json({ message: "Property subscription inactive" }, { status: 403 });
      }
    }

    return NextResponse.json({
      id: pDoc.id,
      name: pData?.name || "PG Property",
      address: pData?.address || "",
      city: pData?.city || "",
    });
  } catch (error) {
    console.error("[Join API GET]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST tenant self-onboarding application
export async function POST(
  req: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    if (!propertyId) return NextResponse.json({ message: "Property ID required" }, { status: 400 });

    const pDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!pDoc.exists) return NextResponse.json({ message: "Property not found" }, { status: 404 });

    const body = await req.json();
    const name = String(body.name || "").trim().slice(0, 100);
    const phone = String(body.phone || "").trim().replace(/[^\d+\-\s]/g, "").slice(0, 15);
    const emergency_contact = String(body.emergency_contact || "").trim().replace(/[^\d+\-\s]/g, "").slice(0, 15);
    const id_proof_url = body.id_proof_url || null;

    if (!name) return NextResponse.json({ message: "Full Name is required" }, { status: 400 });
    if (!phone) return NextResponse.json({ message: "Phone Number is required" }, { status: 400 });

    const appRef = await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("tenantApplications")
      .add({
        name,
        phone,
        emergency_contact,
        id_proof_url,
        status: "pending",
        created_at: new Date(),
      });

    return NextResponse.json({ id: appRef.id, message: "Application submitted successfully! Please wait for PG manager approval." }, { status: 201 });
  } catch (error) {
    console.error("[Join API POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

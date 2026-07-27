import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// GET pending tenant applications for owner's properties
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json([], { status: 200 });

    const propertyIds = pSnap.docs.map((doc) => doc.id);
    const propertiesMap = Object.fromEntries(pSnap.docs.map((doc) => [doc.id, doc.data()]));

    const applications: any[] = [];

    await Promise.all(
      propertyIds.map(async (pId) => {
        const appSnap = await adminDb
          .collection("properties")
          .doc(pId)
          .collection("tenantApplications")
          .where("status", "==", "pending")
          .get();

        appSnap.docs.forEach((doc) => {
          applications.push({
            id: doc.id,
            propertyId: pId,
            propertyName: propertiesMap[pId]?.name || "PG Property",
            ...doc.data(),
          });
        });
      })
    );

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[Applications GET]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST approve application and convert into active tenant
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { applicationId, propertyId, roomId, bedId, rent_amount, security_deposit_amount, billing_cycle_day, action } = body;

    if (!applicationId || !propertyId) return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

    // Verify owner owns property
    const pDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!pDoc.exists || pDoc.data()?.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const appRef = adminDb.collection("properties").doc(propertyId).collection("tenantApplications").doc(applicationId);
    const appSnap = await appRef.get();
    if (!appSnap.exists) return NextResponse.json({ message: "Application not found" }, { status: 404 });

    const appData = appSnap.data()!;

    if (action === "reject") {
      await appRef.update({ status: "rejected", updated_at: new Date() });
      return NextResponse.json({ message: "Application rejected" });
    }

    // Approve & create tenant
    if (!roomId || !bedId) return NextResponse.json({ message: "Room and Bed assignment required" }, { status: 400 });

    const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(roomId).collection("beds").doc(bedId);
    const bedSnap = await bedRef.get();
    if (!bedSnap.exists) return NextResponse.json({ message: "Target bed not found" }, { status: 404 });
    if (bedSnap.data()?.status === "occupied") return NextResponse.json({ message: "Target bed is already occupied" }, { status: 400 });

    const batch = adminDb.batch();

    // 1. Create tenant
    const newTenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc();
    const tenantId = newTenantRef.id;

    batch.set(newTenantRef, {
      name: appData.name,
      phone: appData.phone,
      emergency_contact: appData.emergency_contact || "",
      id_proof_url: appData.id_proof_url || null,
      roomId,
      bedId,
      rent_amount: Number(rent_amount) || 0,
      security_deposit_amount: Number(security_deposit_amount) || 0,
      billing_cycle_day: Number(billing_cycle_day) || 5,
      status: "active",
      date_joined: new Date().toISOString().split("T")[0],
      created_at: new Date(),
    });

    // 2. Mark bed occupied
    batch.update(bedRef, {
      status: "occupied",
      tenantId: tenantId,
      updated_at: new Date(),
    });

    // 3. Update application status
    batch.update(appRef, {
      status: "approved",
      tenantId: tenantId,
      updated_at: new Date(),
    });

    await batch.commit();

    return NextResponse.json({ message: "Tenant application approved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("[Applications POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

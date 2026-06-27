import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    
    const body = await req.json();
    const { tenants, propertyId } = body;

    const propertyIds = pSnap.docs.map(doc => doc.id);
    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      targetPropertyId = pSnap.docs[0].id;
    } else if (!propertyIds.includes(targetPropertyId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const propertyRef = adminDb.collection("properties").doc(targetPropertyId);

    if (!tenants || !Array.isArray(tenants) || tenants.length === 0) {
      return NextResponse.json({ message: "No valid tenants found in data." }, { status: 400 });
    }

    // Fetch all rooms and their beds
    const rSnap = await propertyRef.collection("rooms").get();
    const roomsMap: Record<string, any> = {};
    const bedsMap: Record<string, { roomId: string; bedId: string; status: string; label: string }> = {};

    await Promise.all(
      rSnap.docs.map(async (rDoc) => {
        const roomData = rDoc.data();
        roomsMap[roomData.room_number] = rDoc.id; // Map room_number -> roomId
        
        const bSnap = await rDoc.ref.collection("beds").get();
        bSnap.docs.forEach((bDoc) => {
          const bedData = bDoc.data();
          // Map "RoomNumber_BedLabel" -> bed details
          const key = `${roomData.room_number}_${bedData.bed_label}`.toLowerCase();
          bedsMap[key] = {
            roomId: rDoc.id,
            bedId: bDoc.id,
            status: bedData.status,
            label: bedData.bed_label
          };
        });
      })
    );

    const batch = adminDb.batch();
    let addedCount = 0;
    let skippedCount = 0;

    for (const t of tenants) {
      const roomNum = String(t.roomnumber || "").trim().toLowerCase();
      const bedLbl = String(t.bedlabel || "").trim().toLowerCase();
      
      const bedKey = `${roomNum}_${bedLbl}`;
      const bedInfo = bedsMap[bedKey];

      // Validate required fields and bed availability
      if (!t.name || !t.phone || !bedInfo || bedInfo.status === "occupied") {
        skippedCount++;
        continue;
      }

      const newTenantRef = propertyRef.collection("tenants").doc();
      const rentAmount = parseFloat(t.rentamount) || 0;
      
      batch.set(newTenantRef, {
        roomId: bedInfo.roomId,
        bedId: bedInfo.bedId,
        name: t.name || "",
        phone: t.phone || "",
        emergency_contact: t.emergencycontact || "",
        rent_amount: rentAmount,
        billing_cycle_day: parseInt(t.billingcycleday) || 5,
        security_deposit_amount: parseFloat(t.securitydeposit) || 0,
        date_joined: new Date().toISOString().split('T')[0],
        status: "active",
        created_at: new Date(),
      });

      const bedRef = propertyRef.collection("rooms").doc(bedInfo.roomId).collection("beds").doc(bedInfo.bedId);
      batch.update(bedRef, { status: "occupied" });

      // Mark bed as occupied locally so subsequent rows don't try to use it
      bedInfo.status = "occupied";
      addedCount++;
    }

    if (addedCount > 0) {
      await batch.commit();
      return NextResponse.json({ message: `Successfully added ${addedCount} tenants. Skipped ${skippedCount} invalid rows.` });
    } else {
      return NextResponse.json({ message: "No valid tenants added. Check format and bed availability." }, { status: 400 });
    }

  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

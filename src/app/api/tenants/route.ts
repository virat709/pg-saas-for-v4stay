import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();

    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyId = pSnap.docs[0].id;

    const tSnap = await adminDb.collection("properties").doc(propertyId).collection("tenants").get();
    
    const tenants = await Promise.all(tSnap.docs.map(async (tDoc) => {
      const tData = tDoc.data();
      let bedData = null;
      
      if (tData.roomId && tData.bedId) {
        const bSnap = await adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tData.roomId).collection("beds").doc(tData.bedId).get();
        if (bSnap.exists) {
          const rSnap = await adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tData.roomId).get();
          bedData = {
            id: bSnap.id,
            ...bSnap.data(),
            room: rSnap.exists ? { id: rSnap.id, ...rSnap.data() } : null
          };
        }
      }
      
      return {
        id: tDoc.id,
        ...tData,
        bed: bedData
      };
    }));

    // Sort descending by created_at
    tenants.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();

    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyId = pSnap.docs[0].id;

    const body = await req.json();
    const { name, phone, bedId: combinedBedId, date_joined, rent_amount, billing_cycle_day, security_deposit_amount, emergency_contact, photo, id_proof_doc } = body;

    // Input validation
    if (!name?.trim()) return NextResponse.json({ message: "Name is required" }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ message: "Phone is required" }, { status: 400 });
    if (!combinedBedId || !combinedBedId.includes("_")) {
      return NextResponse.json({ message: "A valid bed assignment is required" }, { status: 400 });
    }
    if (!rent_amount || isNaN(parseFloat(rent_amount))) {
      return NextResponse.json({ message: "Valid rent amount is required" }, { status: 400 });
    }

    const [roomId, bedId] = combinedBedId.split("_");

    // Check if bed is already occupied
    const bSnap = await adminDb.collection("properties").doc(propertyId).collection("rooms").doc(roomId).collection("beds").doc(bedId).get();
    if (!bSnap.exists || bSnap.data()?.status === "occupied") {
      return NextResponse.json({ message: "Bed is unavailable" }, { status: 400 });
    }

    const batch = adminDb.batch();
    const newTenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc();

    batch.set(newTenantRef, {
      roomId,
      bedId,
      name,
      phone,
      date_joined,
      rent_amount: parseFloat(rent_amount),
      billing_cycle_day: parseInt(billing_cycle_day),
      security_deposit_amount: parseFloat(security_deposit_amount),
      emergency_contact: emergency_contact || null,
      photo: photo || null,
      id_proof_doc: id_proof_doc || null,
      status: "active",
      created_at: new Date()
    });

    const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(roomId).collection("beds").doc(bedId);
    batch.update(bedRef, {
      status: "occupied",
      tenantId: newTenantRef.id,
      updated_at: new Date()
    });

    await batch.commit();

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const magicLink = `${baseUrl}/t/${newTenantRef.id}`;
    const propertyData = pSnap.docs[0].data();
    const message = `Welcome to ${propertyData.name}, ${name}! Here is your secure tenant portal link to view your rent details and raise complaints: ${magicLink}`;
    console.log(`[WHATSAPP MOCK] Sent to ${phone}: ${message}`);

    return NextResponse.json({ id: newTenantRef.id, name, status: "active" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

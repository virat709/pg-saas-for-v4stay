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

    const rSnap = await adminDb.collection("properties").doc(propertyId).collection("rooms").get();
    
    const rooms = await Promise.all(rSnap.docs.map(async (roomDoc) => {
      const roomData = roomDoc.data();
      const bSnap = await adminDb.collection("properties").doc(propertyId).collection("rooms").doc(roomDoc.id).collection("beds").get();
      const beds = bSnap.docs.map(b => ({ id: b.id, ...b.data() }));
      
      return {
        id: roomDoc.id,
        ...roomData,
        beds
      };
    }));

    // Sort rooms by floor then room_number
    (rooms as any[]).sort((a, b) => {
      if (a.floor === b.floor) {
        return (a.room_number ?? '').localeCompare(b.room_number ?? '');
      }
      return (a.floor ?? '').localeCompare(b.floor ?? '');
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    let pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();

    let propertyId;
    if (pSnap.empty) {
      // Auto-create property if doesn't exist for MVP
      const newProp = await adminDb.collection("properties").add({
        ownerId: session.user.id,
        name: "My PG",
        address: "123 Main St",
        city: "City",
        created_at: new Date()
      });
      propertyId = newProp.id;
    } else {
      propertyId = pSnap.docs[0].id;
    }

    const { room_number, floor, sharing_type } = await req.json();

    // Input validation
    if (!room_number?.toString().trim()) {
      return NextResponse.json({ message: "Room number is required" }, { status: 400 });
    }
    if (!floor?.toString().trim()) {
      return NextResponse.json({ message: "Floor is required" }, { status: 400 });
    }
    const sharingTypeNum = parseInt(sharing_type);
    if (isNaN(sharingTypeNum) || sharingTypeNum < 1 || sharingTypeNum > 20) {
      return NextResponse.json({ message: "Sharing type must be a number between 1 and 20" }, { status: 400 });
    }

    const batch = adminDb.batch();
    const roomRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc();
    
    const roomData = {
      room_number,
      floor,
      sharing_type: sharingTypeNum,
      created_at: new Date()
    };
    
    batch.set(roomRef, roomData);

    const beds = [];
    for (let i = 0; i < sharingTypeNum; i++) {
      const bedRef = adminDb
        .collection("properties")
        .doc(propertyId)
        .collection("rooms")
        .doc(roomRef.id)
        .collection("beds")
        .doc();
        
      const bedData = {
        bed_label: `Bed ${i + 1}`,
        status: "vacant",
        tenant: null,
        created_at: new Date()
      };
      
      batch.set(bedRef, bedData);
      beds.push({ id: bedRef.id, bed_label: bedData.bed_label, status: bedData.status });
    }

    await batch.commit();

    return NextResponse.json({
      id: roomRef.id,
      room_number,
      floor,
      sharing_type: sharingTypeNum,
      beds
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

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
    if (pSnap.empty) return NextResponse.json([], { status: 200 });
    const propertyIds = pSnap.docs.map(doc => doc.id);
    const propertiesMap = Object.fromEntries(pSnap.docs.map(doc => [doc.id, doc.data()]));

    const { searchParams } = new URL(req.url);
    const propertyIdParam = searchParams.get("propertyId");

    let targets = propertyIds;
    if (propertyIdParam && propertyIdParam !== "all") {
      if (!propertyIds.includes(propertyIdParam)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targets = [propertyIdParam];
    }

    const allRooms: any[] = [];

    await Promise.all(
      targets.map(async (pId) => {
        const rSnap = await adminDb.collection("properties").doc(pId).collection("rooms").get();
        
        const bedsByRoom: Record<string, any[]> = {};
        await Promise.all(
          rSnap.docs.map(async (roomDoc) => {
            const bSnap = await roomDoc.ref.collection("beds").get();
            bedsByRoom[roomDoc.id] = bSnap.docs.map((bDoc) => ({
              id: bDoc.id,
              ...bDoc.data()
            }));
          })
        );

        rSnap.docs.forEach((roomDoc) => {
          const roomData = roomDoc.data();
          const beds = bedsByRoom[roomDoc.id] || [];
          beds.sort((a: any, b: any) => (a.bed_label ?? "").localeCompare(b.bed_label ?? ""));
          allRooms.push({
            id: roomDoc.id,
            ...roomData,
            beds,
            propertyId: pId,
            propertyName: propertiesMap[pId]?.name || "My PG"
          });
        });
      })
    );

    // Sort rooms by floor then room_number
    allRooms.sort((a, b) => {
      if (a.floor === b.floor) {
        return (a.room_number ?? '').localeCompare(b.room_number ?? '');
      }
      return (a.floor ?? '').localeCompare(b.floor ?? '');
    });

    return NextResponse.json(allRooms, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
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

    let targetPropertyId;
    if (pSnap.empty) {
      // Auto-create property if doesn't exist for MVP
      const newProp = await adminDb.collection("properties").add({
        ownerId: session.user.id,
        name: "My PG",
        address: "123 Main St",
        city: "City",
        created_at: new Date()
      });
      targetPropertyId = newProp.id;
    } else {
      targetPropertyId = pSnap.docs[0].id;
    }

    const body = await req.json();
    const { room_number, floor, sharing_type, propertyId } = body;

    if (propertyId && !pSnap.empty) {
      const propertyIds = pSnap.docs.map(doc => doc.id);
      if (!propertyIds.includes(propertyId)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targetPropertyId = propertyId;
    }

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
    const roomRef = adminDb.collection("properties").doc(targetPropertyId).collection("rooms").doc();
    
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
        .doc(targetPropertyId)
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

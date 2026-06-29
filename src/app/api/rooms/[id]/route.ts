import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const { id: roomId } = await params;
    const body = await req.json();
    const { room_number, floor } = body;
    
    if (!room_number || !floor) return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    
    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyIds = pSnap.docs.map(doc => doc.id);
    
    let targetPropertyId = null;
    for (const pId of propertyIds) {
      const rDoc = await adminDb.collection("properties").doc(pId).collection("rooms").doc(roomId).get();
      if (rDoc.exists) {
        targetPropertyId = pId;
        break;
      }
    }
    
    if (!targetPropertyId) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }
    
    const roomRef = adminDb.collection("properties").doc(targetPropertyId).collection("rooms").doc(roomId);
    await roomRef.update({
      room_number,
      floor,
      updated_at: new Date()
    });
    
    return NextResponse.json({ message: "Room updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    
    const { id: roomId } = await params;
    
    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyIds = pSnap.docs.map(doc => doc.id);
    
    let targetPropertyId = null;
    for (const pId of propertyIds) {
      const rDoc = await adminDb.collection("properties").doc(pId).collection("rooms").doc(roomId).get();
      if (rDoc.exists) {
        targetPropertyId = pId;
        break;
      }
    }
    
    if (!targetPropertyId) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }
    
    const roomRef = adminDb.collection("properties").doc(targetPropertyId).collection("rooms").doc(roomId);
    const bedsSnap = await roomRef.collection("beds").get();
    
    // Check if any bed is occupied
    const occupied = bedsSnap.docs.some(d => d.data().status === "occupied");
    if (occupied) {
      return NextResponse.json({ message: "Cannot delete a room with occupied beds. Vacate or move the tenants first." }, { status: 400 });
    }
    
    const batch = adminDb.batch();
    bedsSnap.docs.forEach(bed => {
      batch.delete(bed.ref);
    });
    batch.delete(roomRef);
    
    await batch.commit();
    
    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { upi_id } = body;

    // Validate UPI ID format (e.g. name@bank or phone@upi) — allow empty to clear
    if (upi_id && (upi_id.length > 100 || (upi_id.trim() !== "" && !/^[a-zA-Z0-9._\-]+@[a-zA-Z0-9]+$/.test(upi_id.trim())))) {
      return NextResponse.json({ message: "Invalid UPI ID format. Example: 9876543210@ybl or name@oksbi" }, { status: 400 });
    }

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    
    if (pSnap.empty) {
      // If no property exists, we can't save it, though a user shouldn't be here without one
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }
    
    const propId = pSnap.docs[0].id;
    await adminDb.collection("properties").doc(propId).update({ upi_id: upi_id || "" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    
    if (pSnap.empty) return NextResponse.json({ upi_id: "" });
    
    return NextResponse.json({ upi_id: pSnap.docs[0].data().upi_id || "" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

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
    const { upi_id, propertyId } = body;

    // Validate UPI ID format (e.g. name@bank or phone@upi) — allow empty to clear
    if (upi_id && (upi_id.length > 100 || (upi_id.trim() !== "" && !/^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-_]+$/.test(upi_id.trim())))) {
      return NextResponse.json({ message: "Invalid UPI ID format. Example: 9876543210@ybl or name@oksbi" }, { status: 400 });
    }

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    
    if (pSnap.empty) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    const propertyIds = pSnap.docs.map(doc => doc.id);
    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      targetPropertyId = pSnap.docs[0].id;
    } else if (!propertyIds.includes(targetPropertyId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    
    await adminDb.collection("properties").doc(targetPropertyId).update({ upi_id: upi_id || "" });

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

    const propertyIds = pSnap.docs.map(doc => doc.id);
    const { searchParams } = new URL(req.url);
    const propertyIdParam = searchParams.get("propertyId");

    let targetPropertyId = pSnap.docs[0].id;
    if (propertyIdParam && propertyIdParam !== "all") {
      if (!propertyIds.includes(propertyIdParam)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targetPropertyId = propertyIdParam;
    }
    
    const pDoc = pSnap.docs.find(doc => doc.id === targetPropertyId);
    return NextResponse.json({ upi_id: pDoc ? (pDoc.data().upi_id || "") : "" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

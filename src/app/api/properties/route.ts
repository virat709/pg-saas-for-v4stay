import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    const properties = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(properties, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error("Fetch properties error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, address, city } = await req.json();

    if (!name || !address || !city) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();
    const ownerData = ownerDoc.data();
    const limit = ownerData?.property_limit || 1;

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.size >= limit) {
      return NextResponse.json({ 
        message: `You have reached your subscription's property limit (${limit} PG(s)). Please upgrade your subscription to add more properties.` 
      }, { status: 403 });
    }

    const propertiesRef = adminDb.collection("properties");
    const newPropertyRef = await propertiesRef.add({
      name,
      address,
      city,
      ownerId: session.user.id,
      created_at: new Date()
    });

    return NextResponse.json({ message: "Property added", id: newPropertyRef.id }, { status: 201 });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

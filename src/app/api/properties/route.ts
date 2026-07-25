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

    const isStaff = (session.user as any).role === "staff";
    if (isStaff) {
      const sPropId = (session.user as any).staffPropertyId;
      if (!sPropId) return NextResponse.json([], { status: 200 });
      const pDoc = await adminDb.collection("properties").doc(sPropId).get();
      if (!pDoc.exists) return NextResponse.json([], { status: 200 });
      return NextResponse.json([{ id: pDoc.id, ...pDoc.data() }], {
        headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
      });
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

    const isStaff = (session.user as any).role === "staff";
    if (isStaff) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, address, city } = await req.json();

    if (!name || !address || !city) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();
    const ownerData = ownerDoc.data();
    
    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    const limit = ownerData?.property_limit !== undefined ? ownerData.property_limit : Math.max(1, pSnap.size);

    if (pSnap.size >= limit) {
      return NextResponse.json({ 
        message: `You have reached your subscription's property limit (${limit} PG(s)). Please upgrade your subscription to add more properties.` 
      }, { status: 403 });
    }

    const propertiesRef = adminDb.collection("properties");
    const newPropertyRef = await propertiesRef.add({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      ownerId: session.user.id,
      created_at: new Date()
    });

    return NextResponse.json({ message: "Property added", id: newPropertyRef.id }, { status: 201 });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isStaff = (session.user as any).role === "staff";
    if (isStaff) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { propertyId, name, address, city } = await req.json();

    if (!propertyId || !name || !address) {
      return NextResponse.json({ message: "Missing propertyId, name, or address." }, { status: 400 });
    }

    const pDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!pDoc.exists) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    if (pDoc.data()?.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await adminDb.collection("properties").doc(propertyId).update({
      name: name.trim(),
      address: address.trim(),
      city: city ? city.trim() : (pDoc.data()?.city || ""),
      updated_at: new Date(),
    });

    return NextResponse.json({ message: "Property updated successfully", success: true });
  } catch (error) {
    console.error("Property update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isStaff = (session.user as any).role === "staff";
    if (isStaff) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ message: "Missing propertyId parameter" }, { status: 400 });
    }

    const pDoc = await adminDb.collection("properties").doc(propertyId).get();
    if (!pDoc.exists) {
      return NextResponse.json({ message: "Property not found" }, { status: 404 });
    }

    if (pDoc.data()?.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.size <= 1) {
      return NextResponse.json({ message: "Cannot delete your only property. You must maintain at least 1 property in your account." }, { status: 400 });
    }

    await adminDb.collection("properties").doc(propertyId).delete();
    return NextResponse.json({ message: "Property deleted successfully", success: true });
  } catch (error) {
    console.error("Property delete error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

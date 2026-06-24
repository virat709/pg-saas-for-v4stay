import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { adminDb } from "@/lib/firebaseAdmin";

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

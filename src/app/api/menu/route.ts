import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEALS = ["breakfast", "lunch", "dinner"];

function emptyMenu() {
  const menu: Record<string, Record<string, string>> = {};
  for (const day of DAYS) {
    menu[day] = { breakfast: "", lunch: "", dinner: "" };
  }
  return menu;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json(emptyMenu());

    const propertyId = pSnap.docs[0].id;
    const menuDoc = await adminDb.collection("properties").doc(propertyId).collection("menu").doc("week").get();

    if (!menuDoc.exists) return NextResponse.json(emptyMenu());

    const data = menuDoc.data() as Record<string, any>;
    const { updatedAt, ...menu } = data;
    return NextResponse.json(menu);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Property not found" }, { status: 404 });

    const propertyId = pSnap.docs[0].id;

    // Build sanitized menu object
    const menu: Record<string, Record<string, string>> = {};
    for (const day of DAYS) {
      menu[day] = {};
      for (const meal of MEALS) {
        menu[day][meal] = typeof body[day]?.[meal] === "string" ? body[day][meal].trim() : "";
      }
    }

    await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("menu")
      .doc("week")
      .set({ ...menu, updatedAt: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

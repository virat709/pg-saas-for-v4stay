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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json(emptyMenu());
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

    const menuDoc = await adminDb.collection("properties").doc(targetPropertyId).collection("menu").doc("week").get();

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
    const { propertyId, ...menuBody } = body;

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Property not found" }, { status: 404 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    let targetPropertyId = pSnap.docs[0].id;
    if (propertyId) {
      if (!propertyIds.includes(propertyId)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targetPropertyId = propertyId;
    }

    // Build sanitized menu object
    const menu: Record<string, Record<string, string>> = {};
    for (const day of DAYS) {
      menu[day] = {};
      for (const meal of MEALS) {
        menu[day][meal] = typeof menuBody[day]?.[meal] === "string" ? menuBody[day][meal].trim() : "";
      }
    }

    await adminDb
      .collection("properties")
      .doc(targetPropertyId)
      .collection("menu")
      .doc("week")
      .set({ ...menu, updatedAt: new Date() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

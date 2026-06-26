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

    const nSnap = await adminDb.collection("properties").doc(propertyId).collection("notices").orderBy("created_at", "desc").get();
    
    const notices = nSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(notices);
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
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyId = pSnap.docs[0].id;

    const body = await req.json();
    const { title, content, priority } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
    }

    const newNoticeRef = adminDb.collection("properties").doc(propertyId).collection("notices").doc();
    
    await newNoticeRef.set({
      title,
      content,
      priority: priority || "normal",
      created_at: new Date(),
    });

    return NextResponse.json({ message: "Notice created successfully", id: newNoticeRef.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyId = pSnap.docs[0].id;

    const noticeId = params.id;
    await adminDb.collection("properties").doc(propertyId).collection("notices").doc(noticeId).delete();

    return NextResponse.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

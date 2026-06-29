import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: noticeId } = await params;

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    let targetPropertyId = null;
    for (const pId of propertyIds) {
      const nDoc = await adminDb.collection("properties").doc(pId).collection("notices").doc(noticeId).get();
      if (nDoc.exists) {
        targetPropertyId = pId;
        break;
      }
    }

    if (!targetPropertyId) return NextResponse.json({ message: "Notice not found" }, { status: 404 });

    await adminDb.collection("properties").doc(targetPropertyId).collection("notices").doc(noticeId).delete();

    return NextResponse.json({ message: "Notice deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Notice delete error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const pSnap = await adminDb.collection("properties")
      .where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const propertyIds = pSnap.docs.map(d => d.id);

    // Find which property has this expense
    for (const pId of propertyIds) {
      const ref = adminDb.collection("properties").doc(pId).collection("expenses").doc(id);
      const snap = await ref.get();
      if (snap.exists) {
        await ref.delete();
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  } catch (err) {
    console.error("[expenses DELETE]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

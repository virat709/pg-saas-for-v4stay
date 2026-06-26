import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    
    if (pSnap.empty) return NextResponse.json({ name: "My PG" });
    
    return NextResponse.json({ name: pSnap.docs[0].data().name || "My PG" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

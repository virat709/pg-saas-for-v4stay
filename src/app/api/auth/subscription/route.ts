import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tier, status } = await req.json();

    const ownerRef = adminDb.collection("owners").doc(session.user.id);
    await ownerRef.update({
      plan_tier: tier,
      subscription_status: status,
      updated_at: new Date()
    });

    return NextResponse.json({ message: "Subscription updated" }, { status: 200 });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

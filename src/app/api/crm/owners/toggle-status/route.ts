import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// Allowed admin email(s) for CRM management
const ADMIN_EMAILS = ["v4services.in@gmail.com"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { ownerId, status } = await req.json();

    if (!ownerId || !status || !["active", "inactive"].includes(status)) {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    const ownerRef = adminDb.collection("owners").doc(ownerId);
    const ownerDoc = await ownerRef.get();

    if (!ownerDoc.exists) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {
      subscription_status: status,
      updated_at: new Date(),
    };

    // If activating an owner that has no activation timestamp, set it now
    if (status === "active" && !ownerDoc.data()?.subscription_activated_at) {
      updateData.subscription_activated_at = new Date();
    }

    await ownerRef.update(updateData);

    return NextResponse.json({ success: true, ownerId, status });
  } catch (error) {
    console.error("[CRM Toggle Status Error]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

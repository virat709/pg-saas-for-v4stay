import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();
    if (!ownerDoc.exists) {
      return NextResponse.json({ message: "Owner not found" }, { status: 404 });
    }

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    const data = ownerDoc.data();
    const propertyLimit = data?.property_limit !== undefined ? data.property_limit : Math.max(1, pSnap.size);

    return NextResponse.json({
      name: data?.name || "",
      email: data?.email || "",
      phone: data?.phone || "",
      created_at: data?.created_at || null,
      subscription_status: data?.subscription_status || "inactive",
      subscription_plan: data?.subscription_plan || null,
      subscription_start: data?.subscription_start || null,
      plan_tier: data?.plan_tier || null,
      property_limit: propertyLimit,
      subscription_activated_at: data?.subscription_activated_at || null,
    });
  } catch (error) {
    console.error("[Settings GET]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone } = body;

    if (!name?.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    await adminDb.collection("owners").doc(session.user.id).update({
      name: name.trim(),
      phone: phone?.trim() || "",
      updated_at: new Date(),
    });

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("[Settings PATCH]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

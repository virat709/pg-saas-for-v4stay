import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// GET — fetch last 30 admin notifications for the logged-in owner
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json([], { status: 200 });

    const snap = await adminDb
      .collection("notifications")
      .where("recipientRole", "==", "admin")
      .orderBy("created_at", "desc")
      .limit(30)
      .get();

    const items = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      // Serialize Firestore Timestamp → plain millis so JSON works
      created_at: d.data().created_at?.toMillis?.() ?? null,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("[Notifications GET]", error);
    return NextResponse.json([], { status: 200 });
  }
}

// PATCH — mark a single notification as read  { id }
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    await adminDb.collection("notifications").doc(id).update({ read: true });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Notifications PATCH]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST — mark ALL unread admin notifications as read
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const snap = await adminDb
      .collection("notifications")
      .where("recipientRole", "==", "admin")
      .where("read", "==", false)
      .get();

    const batch = adminDb.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();

    return NextResponse.json({ ok: true, updated: snap.size });
  } catch (error) {
    console.error("[Notifications POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

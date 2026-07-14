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

    const pSnap = await adminDb
      .collection("properties")
      .where("ownerId", "==", session.user.id)
      .get();

    if (pSnap.empty) {
      return NextResponse.json([]);
    }

    const propertyIds = pSnap.docs.map((doc) => doc.id);

    let snapDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = [];
    if (propertyIds.length <= 30) {
      const snap = await adminDb
        .collection("notifications")
        .where("recipientRole", "==", "admin")
        .where("propertyId", "in", propertyIds)
        .limit(50)
        .get();
      snapDocs = snap.docs;
    } else {
      const batches: string[][] = [];
      for (let i = 0; i < propertyIds.length; i += 30) {
        batches.push(propertyIds.slice(i, i + 30));
      }
      const snaps = await Promise.all(
        batches.map((batch) =>
          adminDb
            .collection("notifications")
            .where("recipientRole", "==", "admin")
            .where("propertyId", "in", batch)
            .limit(50)
            .get()
        )
      );
      snapDocs = snaps.flatMap((s) => s.docs);
    }

    const items = snapDocs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        created_at: d.data().created_at?.toMillis?.() ?? null,
      }))
      .sort((a, b) => {
        const aTime = (a as { created_at: number | null }).created_at ?? 0;
        const bTime = (b as { created_at: number | null }).created_at ?? 0;
        return bTime - aTime;
      })
      .slice(0, 30);

    return NextResponse.json(items);
  } catch (error) {
    console.error("[Notifications GET] Failed to fetch:", error);
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

    const docRef = adminDb.collection("notifications").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }

    const notifData = docSnap.data();
    if (notifData?.recipientRole !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify property ownership
    const propId = notifData?.propertyId;
    if (propId) {
      const propSnap = await adminDb.collection("properties").doc(propId).get();
      if (!propSnap.exists || propSnap.data()?.ownerId !== session.user.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    } else if (notifData?.ownerId && notifData.ownerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await docRef.update({ read: true });
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

    const pSnap = await adminDb
      .collection("properties")
      .where("ownerId", "==", session.user.id)
      .get();

    if (pSnap.empty) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    const propertyIds = pSnap.docs.map((doc) => doc.id);

    let snapDocs: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[] = [];
    if (propertyIds.length <= 30) {
      const snap = await adminDb
        .collection("notifications")
        .where("recipientRole", "==", "admin")
        .where("propertyId", "in", propertyIds)
        .where("read", "==", false)
        .get();
      snapDocs = snap.docs;
    } else {
      const batches: string[][] = [];
      for (let i = 0; i < propertyIds.length; i += 30) {
        batches.push(propertyIds.slice(i, i + 30));
      }
      const snaps = await Promise.all(
        batches.map((batch) =>
          adminDb
            .collection("notifications")
            .where("recipientRole", "==", "admin")
            .where("propertyId", "in", batch)
            .where("read", "==", false)
            .get()
        )
      );
      snapDocs = snaps.flatMap((s) => s.docs);
    }

    if (snapDocs.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 });
    }

    const batch = adminDb.batch();
    snapDocs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();

    return NextResponse.json({ ok: true, updated: snapDocs.length });
  } catch (error) {
    console.error("[Notifications POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

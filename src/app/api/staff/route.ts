import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET — list staff for owner's properties
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role === "staff")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties")
      .where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json([]);

    const all: any[] = [];
    await Promise.all(pSnap.docs.map(async (p) => {
      const sSnap = await adminDb.collection("properties").doc(p.id)
        .collection("staff").get();
      sSnap.docs.forEach(d => {
        const data = d.data();
        // Never return password hash
        const { password_hash, ...safe } = data;
        all.push({ id: d.id, ...safe, propertyId: p.id, propertyName: p.data().name });
      });
    }));

    return NextResponse.json(all);
  } catch (err) {
    console.error("[staff GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST — create a staff account under a property
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role === "staff")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, email, password, propertyId } = await req.json();

    if (!name || !email || !password || !propertyId)
      return NextResponse.json({ message: "name, email, password, propertyId required" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });

    // Verify property belongs to this owner
    const pSnap = await adminDb.collection("properties")
      .where("ownerId", "==", session.user.id).get();
    const propertyIds = pSnap.docs.map(d => d.id);
    if (!propertyIds.includes(propertyId))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Check email not already used by another staff in this property
    const existing = await adminDb.collection("properties").doc(propertyId)
      .collection("staff").where("email", "==", email.toLowerCase().trim()).get();
    if (!existing.empty)
      return NextResponse.json({ message: "A staff account with this email already exists for this property" }, { status: 409 });

    const password_hash = await bcrypt.hash(password, 10);
    const staff = {
      name: name.trim().slice(0, 80),
      email: email.toLowerCase().trim(),
      password_hash,
      role: "staff",
      created_at: new Date(),
    };

    const ref = await adminDb.collection("properties").doc(propertyId)
      .collection("staff").add(staff);

    const { password_hash: _, ...safe } = staff;
    return NextResponse.json({ id: ref.id, ...safe, propertyId }, { status: 201 });
  } catch (err) {
    console.error("[staff POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE — remove a staff account
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role === "staff")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const propertyId = searchParams.get("propertyId");

    if (!staffId || !propertyId)
      return NextResponse.json({ message: "staffId and propertyId required" }, { status: 400 });

    const pSnap = await adminDb.collection("properties")
      .where("ownerId", "==", session.user.id).get();
    if (!pSnap.docs.map(d => d.id).includes(propertyId))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await adminDb.collection("properties").doc(propertyId)
      .collection("staff").doc(staffId).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[staff DELETE]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

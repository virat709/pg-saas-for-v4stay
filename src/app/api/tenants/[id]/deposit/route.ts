import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/** Find the propertyId that owns this tenant, verifying session ownership */
async function resolvePropertyForTenant(ownerId: string, tenantId: string) {
  const pSnap = await adminDb.collection("properties")
    .where("ownerId", "==", ownerId).get();
  for (const p of pSnap.docs) {
    const t = await adminDb.collection("properties").doc(p.id)
      .collection("tenants").doc(tenantId).get();
    if (t.exists) return { propertyId: p.id, tenantDoc: t };
  }
  return null;
}

// GET — list all deposit transactions for a tenant
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;
    const result = await resolvePropertyForTenant(session.user.id, tenantId);
    if (!result) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    const { propertyId, tenantDoc } = result;
    const tenantData = tenantDoc.data()!;

    const snap = await adminDb.collection("properties").doc(propertyId)
      .collection("tenants").doc(tenantId)
      .collection("deposit_ledger")
      .orderBy("date", "asc").get();

    const entries = snap.docs.map(d => ({
      id: d.id, ...d.data(),
      date: d.data().date?.toMillis ? d.data().date.toMillis() : d.data().date,
    }));

    const balance = entries.reduce((sum, e: any) => {
      if (e.type === "collected") return sum + (e.amount || 0);
      if (e.type === "returned" || e.type === "deduction") return sum - (e.amount || 0);
      return sum;
    }, 0);

    return NextResponse.json({
      security_deposit_amount: tenantData.security_deposit_amount || 0,
      balance,
      entries,
    });
  } catch (err) {
    console.error("[deposit GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST — record a deposit transaction
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;
    const body = await req.json();
    const { type, amount, date, note } = body;

    const ALLOWED_TYPES = ["collected", "returned", "deduction"];
    if (!ALLOWED_TYPES.includes(type))
      return NextResponse.json({ message: "type must be: collected | returned | deduction" }, { status: 400 });
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });

    const result = await resolvePropertyForTenant(session.user.id, tenantId);
    if (!result) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    const { propertyId } = result;
    const entry = {
      type,
      amount: parsedAmount,
      date: date ? new Date(date) : new Date(),
      note: (note || "").trim().slice(0, 200),
      created_at: new Date(),
    };

    const ref = await adminDb.collection("properties").doc(propertyId)
      .collection("tenants").doc(tenantId)
      .collection("deposit_ledger").add(entry);

    return NextResponse.json({ id: ref.id, ...entry }, { status: 201 });
  } catch (err) {
    console.error("[deposit POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE — remove a deposit entry
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id: tenantId } = await params;
    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get("entryId");
    if (!entryId) return NextResponse.json({ message: "entryId required" }, { status: 400 });

    const result = await resolvePropertyForTenant(session.user.id, tenantId);
    if (!result) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });

    await adminDb.collection("properties").doc(result.propertyId)
      .collection("tenants").doc(tenantId)
      .collection("deposit_ledger").doc(entryId).delete();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[deposit DELETE]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

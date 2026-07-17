import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = [
  "electricity", "water", "maintenance", "salary",
  "internet", "cleaning", "groceries", "miscellaneous", "custom"
];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const propertyIdParam = searchParams.get("propertyId");
    const month = searchParams.get("month"); // "YYYY-MM" optional filter

    const pSnap = await adminDb.collection("properties")
      .where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json([], { status: 200 });

    const propertyIds = pSnap.docs.map(d => d.id);
    const propertiesMap = Object.fromEntries(pSnap.docs.map(d => [d.id, d.data()]));

    let targets = propertyIds;
    if (propertyIdParam && propertyIdParam !== "all") {
      if (!propertyIds.includes(propertyIdParam))
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      targets = [propertyIdParam];
    }

    const all: any[] = [];
    await Promise.all(targets.map(async (pId) => {
      const snap = await adminDb.collection("properties").doc(pId)
        .collection("expenses").orderBy("date", "desc").get();
      snap.docs.forEach(d => {
        const data = d.data();
        // Month filter in memory (cheaper than index)
        if (month) {
          const dateStr = data.date?.toDate?.()
            ? data.date.toDate().toISOString().slice(0, 7)
            : (data.date ? String(data.date).slice(0, 7) : "");
          if (dateStr !== month) return;
        }
        all.push({
          id: d.id, ...data,
          date: data.date?.toMillis ? data.date.toMillis() : data.date,
          propertyId: pId,
          propertyName: propertiesMap[pId]?.name || "PG"
        });
      });
    }));

    all.sort((a, b) => (b.date || 0) - (a.date || 0));
    return NextResponse.json(all);
  } catch (err) {
    console.error("[expenses GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { propertyId, category, custom_category, amount, date, description,
            is_recurring, recurring_frequency, photo_url } = body;

    if (!propertyId) return NextResponse.json({ message: "propertyId required" }, { status: 400 });
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0)
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    if (!category || !ALLOWED_CATEGORIES.includes(category))
      return NextResponse.json({ message: "Invalid category" }, { status: 400 });

    const pSnap = await adminDb.collection("properties")
      .where("ownerId", "==", session.user.id).get();
    const propertyIds = pSnap.docs.map(d => d.id);
    if (!propertyIds.includes(propertyId))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const expense = {
      category,
      custom_category: category === "custom" ? (custom_category || "").trim().slice(0, 50) : "",
      amount: parsedAmount,
      date: date ? new Date(date) : new Date(),
      description: (description || "").trim().slice(0, 300),
      is_recurring: !!is_recurring,
      recurring_frequency: is_recurring ? (recurring_frequency || "monthly") : null,
      photo_url: photo_url || null,
      created_at: new Date(),
    };

    const ref = await adminDb.collection("properties").doc(propertyId)
      .collection("expenses").add(expense);
    return NextResponse.json({ id: ref.id, ...expense, propertyId }, { status: 201 });
  } catch (err) {
    console.error("[expenses POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

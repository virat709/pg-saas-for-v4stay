import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json([], { status: 200 });
    const propertyIds = pSnap.docs.map(doc => doc.id);
    const propertiesMap = Object.fromEntries(pSnap.docs.map(doc => [doc.id, doc.data()]));

    const { searchParams } = new URL(req.url);
    const propertyIdParam = searchParams.get("propertyId");

    let targets = propertyIds;
    if (propertyIdParam && propertyIdParam !== "all") {
      if (!propertyIds.includes(propertyIdParam)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      targets = [propertyIdParam];
    }

    const allNotices: any[] = [];

    await Promise.all(
      targets.map(async (pId) => {
        const nSnap = await adminDb.collection("properties").doc(pId).collection("notices").orderBy("created_at", "desc").get();
        nSnap.docs.forEach((doc) => {
          allNotices.push({
            id: doc.id,
            ...doc.data(),
            propertyId: pId,
            propertyName: propertiesMap[pId]?.name || "My PG"
          });
        });
      })
    );

    // Sort descending by created_at
    allNotices.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(allNotices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "No property found" }, { status: 404 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    const body = await req.json();
    const { title, content, priority, propertyId } = body;

    let targetPropertyId = propertyId;
    if (!targetPropertyId) {
      targetPropertyId = pSnap.docs[0].id;
    } else if (!propertyIds.includes(targetPropertyId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 });
    }

    const newNoticeRef = adminDb.collection("properties").doc(targetPropertyId).collection("notices").doc();
    
    await newNoticeRef.set({
      title,
      content,
      priority: priority || "normal",
      created_at: new Date(),
    });

    return NextResponse.json({ message: "Notice created successfully", id: newNoticeRef.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

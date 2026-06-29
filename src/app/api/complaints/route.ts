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

    const allComplaints: any[] = [];

    await Promise.all(
      targets.map(async (pId) => {
        const complaintsRef = adminDb.collection("properties").doc(pId).collection("maintenanceRequests");
        const cSnap = await complaintsRef.get();
        
        const [tSnap, rSnap] = await Promise.all([
          adminDb.collection("properties").doc(pId).collection("tenants").get(),
          adminDb.collection("properties").doc(pId).collection("rooms").get(),
        ]);

        const tenantsMap: Record<string, any> = {};
        tSnap.docs.forEach((tDoc) => {
          tenantsMap[tDoc.id] = { id: tDoc.id, ...tDoc.data(), bed: null };
        });

        const roomsMap: Record<string, any> = {};
        rSnap.docs.forEach((rDoc) => {
          roomsMap[rDoc.id] = { id: rDoc.id, ...rDoc.data() };
        });

        const bedsMap: Record<string, any> = {};
        await Promise.all(
          rSnap.docs.map(async (rDoc) => {
            const bSnap = await rDoc.ref.collection("beds").get();
            bSnap.docs.forEach((bDoc) => {
              bedsMap[bDoc.id] = {
                id: bDoc.id,
                ...bDoc.data(),
                room: roomsMap[rDoc.id] || null,
              };
            });
          })
        );

        // Map beds to tenants in memory
        Object.keys(tenantsMap).forEach((tId) => {
          const t = tenantsMap[tId];
          if (t.bedId) {
            t.bed = bedsMap[t.bedId] || null;
          }
        });

        cSnap.docs.forEach((cDoc) => {
          const cData = cDoc.data();
          const tenantData = cData.tenantId ? (tenantsMap[cData.tenantId] || null) : null;
          allComplaints.push({
            id: cDoc.id,
            ...cData,
            tenant: tenantData,
            propertyId: pId,
            propertyName: propertiesMap[pId]?.name || "My PG"
          });
        });
      })
    );

    allComplaints.sort((a: any, b: any) => {
      if (a.status !== b.status) {
        return a.status.localeCompare(b.status);
      }
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(allComplaints, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, status } = body;

    // Security: whitelist allowed status values
    const ALLOWED_STATUSES = ["open", "in_progress", "resolved"];
    if (!id || !status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid request. Status must be one of: open, in_progress, resolved" }, { status: 400 });
    }

    const pSnap = await adminDb.collection("properties").where("ownerId", "==", session.user.id).get();
    if (pSnap.empty) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    const propertyIds = pSnap.docs.map(doc => doc.id);

    let targetPropertyId = null;
    for (const pId of propertyIds) {
      const cDoc = await adminDb.collection("properties").doc(pId).collection("maintenanceRequests").doc(id).get();
      if (cDoc.exists) {
        targetPropertyId = pId;
        break;
      }
    }

    if (!targetPropertyId) {
      return NextResponse.json({ message: "Unauthorized or Not Found" }, { status: 403 });
    }

    const complaintRef = adminDb.collection("properties").doc(targetPropertyId).collection("maintenanceRequests").doc(id);

    await complaintRef.update({
      status,
      resolvedAt: status === "resolved" ? new Date() : null,
      updated_at: new Date()
    });

    return NextResponse.json({ id, status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

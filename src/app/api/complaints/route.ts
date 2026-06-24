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

    if (pSnap.empty) return NextResponse.json([]);
    const propertyId = pSnap.docs[0].id;

    const complaintsRef = adminDb.collection("properties").doc(propertyId).collection("maintenanceRequests");
    const cSnap = await complaintsRef.get();
    
    const complaints = await Promise.all(cSnap.docs.map(async (cDoc) => {
      const cData = cDoc.data();
      let tenantData = null;
      
      if (cData.tenantId) {
        const tenantRef = adminDb.collection("properties").doc(propertyId).collection("tenants").doc(cData.tenantId);
        const tSnap = await tenantRef.get();
        if (tSnap.exists) {
          const tData = tSnap.data();
          let bedData = null;
          if (tData?.roomId && tData?.bedId) {
            const bedRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tData!.roomId).collection("beds").doc(tData!.bedId);
            const bSnap = await bedRef.get();
            if (bSnap.exists) {
               const roomRef = adminDb.collection("properties").doc(propertyId).collection("rooms").doc(tData!.roomId);
               const rSnap = await roomRef.get();
               bedData = { id: bSnap.id, ...bSnap.data(), room: rSnap.exists ? { id: rSnap.id, ...rSnap.data() } : null };
            }
          }
          tenantData = { id: tSnap.id, ...tData, bed: bedData };
        }
      }
      
      return {
        id: cDoc.id,
        ...cData,
        tenant: tenantData
      };
    }));

    complaints.sort((a: any, b: any) => {
      if (a.status !== b.status) {
        return a.status.localeCompare(b.status);
      }
      const aTime = a.created_at?.toMillis ? a.created_at.toMillis() : (a.created_at instanceof Date ? a.created_at.getTime() : 0);
      const bTime = b.created_at?.toMillis ? b.created_at.toMillis() : (b.created_at instanceof Date ? b.created_at.getTime() : 0);
      return bTime - aTime;
    });

    return NextResponse.json(complaints);
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
    const propertyId = pSnap.docs[0].id;

    const complaintRef = adminDb.collection("properties").doc(propertyId).collection("maintenanceRequests").doc(id);
    const cSnap = await complaintRef.get();

    if (!cSnap.exists) {
      return NextResponse.json({ message: "Unauthorized or Not Found" }, { status: 403 });
    }

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

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import { getTenantAndProperty } from "@/lib/tenantHelper";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const { id } = await params;

    let propertyId: string | null = null;
    let propertyData: any = null;
    let payData: any = null;

    if (session?.user?.id) {
      // Search across ALL owner properties for this payment
      const pSnap = await adminDb
        .collection("properties")
        .where("ownerId", "==", session.user.id)
        .get();

      for (const pDoc of pSnap.docs) {
        const payDoc = await adminDb
          .collection("properties")
          .doc(pDoc.id)
          .collection("payments")
          .doc(id)
          .get();
        if (payDoc.exists) {
          propertyId = pDoc.id;
          propertyData = pDoc.data();
          payData = { id: payDoc.id, ...payDoc.data() };
          break;
        }
      }
    }

    if (!payData && tenantId) {
      // Tenant auth: resolve their property then look up payment directly
      const res = await getTenantAndProperty(tenantId);
      if (res) {
        const pDoc = await adminDb.collection("properties").doc(res.propertyId).get();
        if (pDoc.exists) {
          const payDoc = await adminDb
            .collection("properties")
            .doc(res.propertyId)
            .collection("payments")
            .doc(id)
            .get();
          if (payDoc.exists) {
            const pd = payDoc.data()!;
            // Ensure this payment belongs to the requesting tenant
            if (pd.tenantId !== tenantId) {
              return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }
            propertyId = res.propertyId;
            propertyData = pDoc.data();
            payData = { id: payDoc.id, ...pd };
          }
        }
      }
    }

    if (!payData || !propertyId || !propertyData) {
      return NextResponse.json({ message: "Payment not found or unauthorized" }, { status: 404 });
    }

    // Fetch tenant + room
    let tenantData = null;
    if (payData.tenantId) {
      const tDoc = await adminDb
        .collection("properties")
        .doc(propertyId)
        .collection("tenants")
        .doc(payData.tenantId)
        .get();
      if (tDoc.exists) {
        const td = tDoc.data()!;
        let room = null;
        const roomId = td.roomId;
        if (roomId) {
          const rDoc = await adminDb
            .collection("properties").doc(propertyId)
            .collection("rooms").doc(roomId).get();
          if (rDoc.exists) room = { id: rDoc.id, ...rDoc.data() };
        } else if (td.bedId) {
          // Beds are nested under rooms — find the room that contains this bed
          const roomsSnap = await adminDb
            .collection("properties").doc(propertyId)
            .collection("rooms").get();
          for (const rDoc of roomsSnap.docs) {
            const bedDoc = await rDoc.ref.collection("beds").doc(td.bedId).get();
            if (bedDoc.exists) { room = { id: rDoc.id, ...rDoc.data() }; break; }
          }
        }
        tenantData = { id: tDoc.id, ...td, room };
      }
    }

    return NextResponse.json({
      ...payData,
      tenant: tenantData,
      property: {
        id: propertyId,
        name: propertyData.name,
        address: propertyData.address || null,
      },
    });
  } catch (error) {
    console.error("[Receipt API]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

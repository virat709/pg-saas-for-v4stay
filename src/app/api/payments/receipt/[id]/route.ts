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

    console.log(`[Receipt API GET] ID: ${id}, tenantId: ${tenantId}, adminSession:`, session?.user?.id);

    let propertyId = null;
    let propertyData = null;
    let authorized = false;

    if (session?.user?.id) {
      // Find owner's property
      const pSnap = await adminDb
        .collection("properties")
        .where("ownerId", "==", session.user.id)
        .get();

      if (!pSnap.empty) {
        const propertyDoc = pSnap.docs[0];
        propertyId = propertyDoc.id;
        propertyData = propertyDoc.data();
        authorized = true;
        console.log(`[Receipt API] Admin authorized for property: ${propertyId}`);
      }
    }

    if (!authorized && tenantId) {
      // Verify tenant exists and retrieve their propertyId using our helper
      const res = await getTenantAndProperty(tenantId);
      if (res) {
        propertyId = res.propertyId;
        const pDoc = await adminDb.collection("properties").doc(propertyId).get();
        if (pDoc.exists) {
          propertyData = pDoc.data();
          authorized = true;
          console.log(`[Receipt API] Tenant authorized for property: ${propertyId}`);
        }
      } else {
        console.log(`[Receipt API] Tenant helper returned null for tenantId: ${tenantId}`);
      }
    }

    if (!authorized || !propertyId || !propertyData) {
      console.log(`[Receipt API] Authorization failed: authorized=${authorized}, propertyId=${propertyId}`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch the specific payment
    const payDoc = await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("payments")
      .doc(id)
      .get();

    if (!payDoc.exists) {
      console.log(`[Receipt API] Payment document not found: ${id} under property ${propertyId}`);
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    const payData = payDoc.data()!;
    console.log(`[Receipt API] Payment data retrieved. tenantId on payment: ${payData.tenantId}`);

    // Additional check: if authorized via tenantId, ensure the payment actually belongs to this tenant!
    const authorizedAsAdmin = session?.user?.id && (propertyData?.ownerId === session.user.id);
    if (!authorizedAsAdmin && tenantId && payData.tenantId !== tenantId) {
      console.log(`[Receipt API] Mismatch check failed. Payment tenantId (${payData.tenantId}) !== requested tenantId (${tenantId})`);
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }


    // Fetch tenant
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
        if (td.roomId) {
          const rDoc = await adminDb
            .collection("properties")
            .doc(propertyId)
            .collection("rooms")
            .doc(td.roomId)
            .get();
          if (rDoc.exists) room = { id: rDoc.id, ...rDoc.data() };
        }
        tenantData = { id: tDoc.id, ...td, room };
      }
    }

    return NextResponse.json({
      id: payDoc.id,
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

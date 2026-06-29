import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

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
      }
    } else if (tenantId) {
      // Verify tenant exists and retrieve their propertyId
      const pSnapList = await adminDb.collection("properties").get();
      for (const doc of pSnapList.docs) {
        const tDoc = await doc.ref.collection("tenants").doc(tenantId).get();
        if (tDoc.exists) {
          propertyId = doc.id;
          propertyData = doc.data();
          authorized = true;
          break;
        }
      }
    }

    if (!authorized || !propertyId || !propertyData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;


    // Fetch the specific payment
    const payDoc = await adminDb
      .collection("properties")
      .doc(propertyId)
      .collection("payments")
      .doc(id)
      .get();

    if (!payDoc.exists) {
      return NextResponse.json({ message: "Payment not found" }, { status: 404 });
    }

    const payData = payDoc.data()!;

    // Additional check: if authorized via tenantId, ensure the payment actually belongs to this tenant!
    if (!session?.user?.id && tenantId && payData.tenantId !== tenantId) {
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

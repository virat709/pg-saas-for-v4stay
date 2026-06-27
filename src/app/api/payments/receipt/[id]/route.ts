import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Find owner's property
    const pSnap = await adminDb
      .collection("properties")
      .where("ownerId", "==", session.user.id)
      .get();

    if (pSnap.empty) {
      return NextResponse.json({ message: "No property found" }, { status: 404 });
    }

    const propertyDoc = pSnap.docs[0];
    const propertyId = propertyDoc.id;
    const propertyData = propertyDoc.data();

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

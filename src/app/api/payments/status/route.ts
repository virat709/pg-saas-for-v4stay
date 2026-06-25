import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/status?transactionId=XXX
 *
 * Returns the CURRENT subscription_status of the logged-in owner from Firestore.
 * The /payments/status page polls this endpoint to safely determine when
 * a payment has been verified — without ever trusting redirect URL params.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transactionId");

    // Read the owner's current subscription status from DB
    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();

    if (!ownerDoc.exists) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    const ownerData = ownerDoc.data()!;
    const subscriptionStatus = (ownerData.subscription_status as string) || "inactive";

    // Optionally also check the transaction record for more context
    let transactionStatus = "unknown";
    if (transactionId) {
      const payDoc = await adminDb.collection("payments").doc(transactionId).get();
      if (payDoc.exists) {
        transactionStatus = (payDoc.data()?.status as string) || "unknown";
      }
    }

    return NextResponse.json({
      subscriptionStatus,
      transactionStatus,
      activated: subscriptionStatus === "active",
    });
  } catch (error) {
    console.error("[/api/payments/status] Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

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

    const isStaff = (session.user as any).role === "staff";
    let ownerId = session.user.id;

    if (isStaff) {
      const sPropId = (session.user as any).staffPropertyId;
      if (!sPropId) {
        return NextResponse.json({ role: "staff", activated: true, planTier: "Staff Access", daysLeft: null, expiresAt: null });
      }
      const pDoc = await adminDb.collection("properties").doc(sPropId).get();
      if (!pDoc.exists) {
        return NextResponse.json({ role: "staff", activated: true, planTier: "Staff Access", daysLeft: null, expiresAt: null });
      }
      ownerId = pDoc.data()!.ownerId;
    }

    // Read the owner's current subscription status from DB
    const ownerDoc = await adminDb.collection("owners").doc(ownerId).get();

    if (!ownerDoc.exists) {
      return NextResponse.json({ status: "not_found", role: isStaff ? "staff" : "owner" }, { status: 404 });
    }

    const ownerData = ownerDoc.data()!;
    let subscriptionStatus = (ownerData.subscription_status as string) || "inactive";

    // Parse activation date
    const activatedAtVal = ownerData.subscription_activated_at;
    const activatedAt = activatedAtVal
      ? typeof activatedAtVal === "object" && activatedAtVal.seconds
        ? new Date(activatedAtVal.seconds * 1000)
        : new Date(activatedAtVal)
      : null;

    const planTier = ownerData.plan_tier || ownerData.subscription_plan || "No Active Plan";
    const planTierLower = planTier.toLowerCase();
    let durationMonths = 0;
    if (planTierLower.includes("6 months") || planTierLower.includes("starter")) {
      durationMonths = 6;
    } else if (planTierLower.includes("1 year") || planTierLower.includes("premium")) {
      durationMonths = 12;
    }

    let expiresAt: Date | null = null;
    let daysLeft: number | null = null;

    if (subscriptionStatus === "active" && activatedAt && durationMonths > 0) {
      expiresAt = new Date(activatedAt);
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
      
      const diffTime = expiresAt.getTime() - Date.now();
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) {
        daysLeft = 0;
        subscriptionStatus = "inactive"; // plan completed
      }
    } else if (subscriptionStatus === "active") {
      subscriptionStatus = "inactive"; // no active paid plan
    }

    // Optionally check the transaction record for context
    let transactionStatus = "unknown";
    if (transactionId) {
      // Subscription payments are stored in the top-level `payments` collection
      const payDoc = await adminDb.collection("payments").doc(transactionId).get();
      if (payDoc.exists) {
        transactionStatus = (payDoc.data()?.status as string) || "unknown";
      }
    }

    return NextResponse.json({
      role: isStaff ? "staff" : "owner",
      subscriptionStatus,
      transactionStatus,
      activated: subscriptionStatus === "active",
      planTier,
      daysLeft,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    });
  } catch (error) {
    console.error("[/api/payments/status] Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

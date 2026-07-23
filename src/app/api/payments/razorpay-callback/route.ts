import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const docId = razorpay_subscription_id || razorpay_order_id;

    if (!docId || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    let isAuthentic = false;
    if (razorpay_subscription_id) {
      const sig1 = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
        .digest("hex");
      const sig2 = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_subscription_id}|${razorpay_payment_id}`)
        .digest("hex");
      isAuthentic = (sig1 === razorpay_signature || sig2 === razorpay_signature);
    } else {
      const sigOrder = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      isAuthentic = (sigOrder === razorpay_signature);
    }

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Verify in DB
    const paymentRef = adminDb.collection("payments").doc(docId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data()!;
    if (paymentData.status === "success") {
      return NextResponse.json({ success: true, redirectUrl: "/dashboard" });
    }

    const ownerId = paymentData.ownerId;
    const finalTier = paymentData.planName;
    const propertyLimit = paymentData.propertyCount || 1;
    const isTrial = paymentData.is_trial === true || finalTier === "30 Days Free Trial";

    // Mark success
    await paymentRef.update({ 
      status: "success", 
      payment_id: razorpay_payment_id,
      updated_at: new Date(),
      ...(isTrial ? {
        refund_status: "pending",
        refund_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      } : {})
    });

    // Only reset activation date if the plan tier is actually changing.
    // Property-count-only upgrades (same plan) keep the original start date
    // so the subscription duration is not unfairly shortened.
    const ownerDoc = await adminDb.collection("owners").doc(ownerId).get();
    const existingTier = ownerDoc.data()?.plan_tier;
    const planTierChanged = existingTier !== finalTier;

    // Activate subscription
    await adminDb.collection("owners").doc(ownerId).update({
      plan_tier: finalTier,
      subscription_status: "active",
      is_trial: isTrial,
      ...(planTierChanged ? { subscription_activated_at: new Date() } : {}),
      property_limit: propertyLimit,
      updated_at: new Date(),
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Razorpay subscription callback error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

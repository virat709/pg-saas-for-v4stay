import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Verify in DB
    const paymentRef = adminDb.collection("payments").doc(razorpay_order_id);
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

    // Mark success
    await paymentRef.update({ 
      status: "success", 
      payment_id: razorpay_payment_id,
      updated_at: new Date() 
    });

    const ownerId = paymentData.ownerId;
    const finalTier = paymentData.planName;
    const propertyLimit = paymentData.propertyCount || 1;

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

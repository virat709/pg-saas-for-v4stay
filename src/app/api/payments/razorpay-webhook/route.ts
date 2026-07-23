import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.warn("[WEBHOOK] Missing webhook secret");
      return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
    }

    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[WEBHOOK] Invalid signature");
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[WEBHOOK] Received event: ${eventType}`);

    if (eventType === "subscription.charged") {
      const subEntity = event.payload?.subscription?.entity;
      const ownerId = subEntity?.notes?.ownerId;
      const subId = subEntity?.id;

      if (ownerId) {
        console.log(`[WEBHOOK] Subscription charged for owner ${ownerId} (sub: ${subId})`);
        await adminDb.collection("owners").doc(ownerId).update({
          subscription_status: "active",
          subscription_activated_at: new Date(),
          updated_at: new Date(),
        });
      }
    } else if (eventType === "subscription.halted" || eventType === "subscription.cancelled") {
      const subEntity = event.payload?.subscription?.entity;
      const ownerId = subEntity?.notes?.ownerId;

      if (ownerId) {
        console.log(`[WEBHOOK] Subscription halted/cancelled for owner ${ownerId}`);
        await adminDb.collection("owners").doc(ownerId).update({
          subscription_status: "inactive",
          updated_at: new Date(),
        });
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error: any) {
    console.error("[WEBHOOK] Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

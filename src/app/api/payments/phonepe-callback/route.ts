import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

/**
 * POST — called by:
 *   a) Our mock checkout (sends X-Mock-Secret: transactionId)
 *   b) Real PhonePe server-to-server webhook (sends X-VERIFY checksum)
 *
 * GET — called by real PhonePe redirect after checkout (user browser redirect).
 *   We do NOT trust GET params for payment status — we redirect to /payments/status
 *   which polls the DB.
 */

export async function POST(req: Request) {
  return await handleCallback(req);
}

/**
 * GET handler — PhonePe redirects the user browser here after checkout.
 * We never grant access based on redirect params alone; instead we bounce
 * to the /payments/status polling page.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get("transactionId");

  const host = req.headers.get("host") || "localhost:3000";
  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  const dest = transactionId
    ? `/payments/status?transactionId=${transactionId}`
    : "/onboarding/subscription";

  return NextResponse.redirect(new URL(dest, `${protocol}://${host}`));
}

async function handleCallback(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let transactionId = searchParams.get("transactionId");

    // ── Parse body ────────────────────────────────────────────────────────
    let bodyText = "";
    try {
      bodyText = await req.text();
    } catch {
      // empty body is fine
    }

    let body: Record<string, unknown> = {};
    try {
      if (bodyText) body = JSON.parse(bodyText);
    } catch {
      // not JSON — may be form-encoded from PhonePe webhook
    }

    if (!transactionId && typeof body.transactionId === "string") {
      transactionId = body.transactionId;
    }

    if (!transactionId) {
      return NextResponse.json({ message: "Missing transaction ID" }, { status: 400 });
    }

    console.log(`[callback] Processing transaction: ${transactionId}`);

    // ── Fetch payment record from DB ──────────────────────────────────────
    const paymentRef = adminDb.collection("payments").doc(transactionId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      console.error(`[callback] Payment record not found: ${transactionId}`);
      return NextResponse.json({ message: "Payment record not found" }, { status: 404 });
    }

    const paymentData = paymentDoc.data()!;
    const ownerId = paymentData.ownerId as string;
    const finalTier = paymentData.planName as string;
    const storedSecret = paymentData.callbackSecret as string;
    const currentStatus = paymentData.status as string;

    // Guard: already processed
    if (currentStatus === "success") {
      console.log(`[callback] Already processed: ${transactionId}`);
      return NextResponse.json({ success: true, redirectUrl: "/dashboard" });
    }

    // ── Determine callback source & verify ────────────────────────────────
    const xVerify = req.headers.get("X-VERIFY") || req.headers.get("x-verify");
    const xMockSecret = req.headers.get("X-Mock-Secret") || req.headers.get("x-mock-secret");

    let isVerified = false;

    // 1. Real PhonePe webhook: verify X-VERIFY checksum
    if (xVerify && process.env.PHONEPE_SALT_KEY && process.env.PHONEPE_SALT_INDEX) {
      try {
        // PhonePe v1 webhook: body is { response: base64 }, X-VERIFY = sha256(base64 + "/pg/v1/pay" + saltKey) + "###" + saltIndex
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;

        // body.response is the base64-encoded payload
        const base64Response = typeof body.response === "string" ? body.response : "";
        const stringToHash = base64Response + "/pg/v1/pay" + saltKey;
        const expectedChecksum =
          crypto.createHash("sha256").update(stringToHash).digest("hex") +
          "###" +
          saltIndex;

        if (xVerify === expectedChecksum) {
          // Decode the response payload and check the transaction code
          const decoded = JSON.parse(Buffer.from(base64Response, "base64").toString("utf-8"));
          const code: string = decoded?.code || "";
          isVerified = code === "PAYMENT_SUCCESS";
          console.log(`[callback] PhonePe X-VERIFY valid. code=${code}`);
        } else {
          console.warn("[callback] X-VERIFY checksum mismatch — ignoring.");
        }
      } catch (err) {
        console.error("[callback] Error verifying PhonePe signature:", err);
      }
    }

    // 2. Mock checkout: verify X-Mock-Secret matches HMAC stored in DB
    if (!isVerified && xMockSecret && storedSecret) {
      const expectedSecret = crypto
        .createHmac("sha256", process.env.NEXTAUTH_SECRET || "fallback-secret")
        .update(transactionId)
        .digest("hex");

      if (storedSecret === expectedSecret && xMockSecret === transactionId) {
        isVerified = true;
        console.log(`[callback] Mock secret verified for: ${transactionId}`);
      } else {
        console.warn("[callback] Mock secret mismatch.");
      }
    }

    if (!isVerified) {
      console.warn(`[callback] Could not verify payment for ${transactionId}. Marking failed.`);
      await paymentRef.update({ status: "failed", updated_at: new Date() });
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }

    // ── Mark payment success and activate subscription ────────────────────
    await paymentRef.update({ status: "success", updated_at: new Date() });

    const propertyLimit = (paymentData.propertyCount as number) || 1;

    const ownerRef = adminDb.collection("owners").doc(ownerId);
    await ownerRef.update({
      plan_tier: finalTier,
      subscription_status: "active",
      subscription_activated_at: new Date(),
      property_limit: propertyLimit,
      updated_at: new Date(),
    });

    console.log(`[callback] Activated subscription for owner ${ownerId} — plan: ${finalTier}`);

    return NextResponse.json({ success: true, redirectUrl: "/payments/status?transactionId=" + transactionId });
  } catch (error) {
    console.error("[callback] Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

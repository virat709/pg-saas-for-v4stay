import Razorpay from "razorpay";
import { adminDb } from "@/lib/firebaseAdmin";

export async function processPendingRefunds() {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error("[REFUND] Razorpay credentials not configured");
    return { success: false, message: "Razorpay credentials not configured" };
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  try {
    const now = new Date();
    // Fetch payments that are successful, pending refund, and refund_at <= now
    const pSnap = await adminDb
      .collection("payments")
      .where("planName", "==", "30 Days Free Trial")
      .where("status", "==", "success")
      .where("refund_status", "==", "pending")
      .where("refund_at", "<=", now)
      .get();

    const results = [];

    for (const doc of pSnap.docs) {
      const pData = doc.data();
      const paymentId = pData.payment_id;

      if (!paymentId) {
        console.warn(`[REFUND] Document ${doc.id} is missing payment_id`);
        continue;
      }

      try {
        console.log(`[REFUND] Fetching payment details and triggering refund for payment ${paymentId} (${doc.id})...`);
        const paymentObj = await razorpay.payments.fetch(paymentId);
        const refundAmount = paymentObj?.amount || 500; // full charged amount in paise (e.g., ₹5 = 500 paise)

        const refund = await razorpay.payments.refund(paymentId, {
          amount: refundAmount,
          notes: {
            reason: "30-day free trial verification refund",
            ownerId: pData.ownerId,
            paymentDocId: doc.id
          }
        });

        await doc.ref.update({
          refund_status: "refunded",
          refund_id: refund.id,
          refunded_at: new Date(),
          updated_at: new Date()
        });

        results.push({ id: doc.id, paymentId, status: "refunded", refundId: refund.id });
      } catch (err: any) {
        console.error(`[REFUND] Failed refunding ${paymentId} (${doc.id}):`, err);
        await doc.ref.update({
          refund_status: "failed",
          refund_error: err.message || String(err),
          updated_at: new Date()
        });
        results.push({ id: doc.id, paymentId, status: "failed", error: err.message || String(err) });
      }
    }

    return { success: true, processed: results };
  } catch (error: any) {
    console.error("[REFUND] Query/Processing error:", error);
    return { success: false, error: error.message || String(error) };
  }
}

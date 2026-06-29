import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { planName, price, propertyCount } = await req.json();

    // ── Server-side plan validation & pricing calculation ─────────────────
    const count = parseInt(propertyCount) || 1;
    if (count < 1) {
      return NextResponse.json({ message: "Invalid property count." }, { status: 400 });
    }

    let expectedPrice = 0;
    if (planName === "PGmate Starter 6 Months") {
      expectedPrice = 6999 + (count - 1) * 4999;
    } else if (planName === "PGmate Premium 1 Year") {
      expectedPrice = 11999 + (count - 1) * 6999;
    } else {
      return NextResponse.json(
        { message: "Invalid plan name. Choose 'PGmate Starter 6 Months' or 'PGmate Premium 1 Year'." },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price !== expectedPrice) {
      return NextResponse.json(
        { message: `Price mismatch. Expected ₹${expectedPrice} but received ₹${price}` },
        { status: 400 }
      );
    }

    // ── Check owner doesn't already have an active subscription ───────────
    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();
    if (ownerDoc.exists) {
      const ownerData = ownerDoc.data();
      if (ownerData?.subscription_status === "active") {
        return NextResponse.json(
          { message: "Subscription already active." },
          { status: 409 }
        );
      }
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // ── Store pending payment with a callback secret ───────────────────────
    // The secret is stored in DB and echoed back by the mock checkout in the
    // X-Mock-Secret header — prevents arbitrary POST to the callback endpoint.
    const callbackSecret = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
      .update(transactionId)
      .digest("hex");

    await adminDb
      .collection("payments")
      .doc(transactionId)
      .set({
        ownerId: session.user.id,
        transactionId,
        amount: price,
        planName,
        propertyCount: count,
        status: "pending",
        callbackSecret,
        created_at: new Date(),
        updated_at: new Date(),
      });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Check if PhonePe configuration exists
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const hostUrl = process.env.PHONEPE_HOST_URL;

    if (merchantId && saltKey && saltIndex && hostUrl) {
      // Official PhonePe PG integration (Sandbox or Production)
      const payload = {
        merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: session.user.id,
        amount: price * 100, // PhonePe expects amount in paise
        redirectUrl: `${baseUrl}/payments/status?transactionId=${transactionId}`,
        redirectMode: "GET",
        callbackUrl: `${baseUrl}/api/payments/phonepe-callback?transactionId=${transactionId}`,
        paymentInstrument: {
          type: "PAY_PAGE",
        },
      };

      const buffer = Buffer.from(JSON.stringify(payload));
      const base64Payload = buffer.toString("base64");
      const stringToSign = base64Payload + "/pg/v1/pay" + saltKey;
      const sha256 = crypto.createHash("sha256").update(stringToSign).digest("hex");
      const checksum = `${sha256}###${saltIndex}`;

      try {
        const response = await fetch(`${hostUrl}/pg/v1/pay`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            accept: "application/json",
          },
          body: JSON.stringify({ request: base64Payload }),
        });

        const data = await response.json();
        if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
          return NextResponse.json(
            { url: data.data.instrumentResponse.redirectInfo.url },
            { status: 200 }
          );
        } else {
          console.error("PhonePe API initiation failed:", data);
        }
      } catch (err) {
        console.error("PhonePe API fetch error, falling back to mock page:", err);
      }
    }

    // Fallback: Redirect to local Mock PhonePe checkout page
    const mockRedirectUrl = `${baseUrl}/payments/phonepe-mock?transactionId=${transactionId}&amount=${price}&tier=${encodeURIComponent(planName)}`;
    return NextResponse.json({ url: mockRedirectUrl }, { status: 200 });
  } catch (error) {
    console.error("PhonePe payment initiation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

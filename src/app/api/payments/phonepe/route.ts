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

    const { planName, price } = await req.json();
    if (!planName || typeof price !== "number") {
      return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Store pending payment in database
    await adminDb.collection("payments").doc(transactionId).set({
      ownerId: session.user.id,
      transactionId: transactionId,
      amount: price,
      planName: planName,
      status: "pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Check if PhonePe configuration exists
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    const hostUrl = process.env.PHONEPE_HOST_URL;

    if (merchantId && saltKey && saltIndex && hostUrl) {
      // Official PhonePe PG integration (e.g. Sandbox or Production)
      const payload = {
        merchantId: merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: session.user.id,
        amount: price * 100, // PhonePe expects amount in paise
        redirectUrl: `${baseUrl}/api/payments/phonepe-callback?transactionId=${transactionId}&tier=${encodeURIComponent(planName)}`,
        redirectMode: "POST",
        callbackUrl: `${baseUrl}/api/payments/phonepe-callback?transactionId=${transactionId}&tier=${encodeURIComponent(planName)}`,
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
            "accept": "application/json",
          },
          body: JSON.stringify({ request: base64Payload }),
        });

        const data = await response.json();
        if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
          return NextResponse.json({ url: data.data.instrumentResponse.redirectInfo.url }, { status: 200 });
        } else {
          console.error("PhonePe API initiation failed:", data);
        }
      } catch (err) {
        console.error("PhonePe API fetch error, falling back to mock page:", err);
      }
    }

    // Default Fallback: Redirect to local Mock PhonePe checkout page
    const mockRedirectUrl = `${baseUrl}/payments/phonepe-mock?transactionId=${transactionId}&amount=${price}&tier=${encodeURIComponent(planName)}`;
    return NextResponse.json({ url: mockRedirectUrl }, { status: 200 });

  } catch (error) {
    console.error("PhonePe payment initiation error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

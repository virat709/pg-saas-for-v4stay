import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  return await handleCallback(req);
}

export async function GET(req: Request) {
  return await handleCallback(req);
}

async function handleCallback(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract parameters from query parameters or request body
    let transactionId = searchParams.get("transactionId");
    let tier = searchParams.get("tier");
    let status = searchParams.get("status") || "success"; // Default to success for testing/mock

    // If it's a POST request, parse body to see if PhonePe or our mock sent data
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.transactionId) transactionId = body.transactionId;
        if (body.tier) tier = body.tier;
        if (body.status) status = body.status;
        
        // Handle official PhonePe webhook/redirect body (which usually contains encrypted payload or key-value fields)
        if (body.code) {
          status = body.code === "PAYMENT_SUCCESS" ? "success" : "failed";
        }
      } catch (e) {
        // Body is not JSON or empty, ignore
      }
    }

    if (!transactionId) {
      return NextResponse.json({ message: "Missing transaction ID" }, { status: 400 });
    }

    console.log(`Processing PhonePe callback for transaction: ${transactionId}, status: ${status}`);

    // Retrieve the payment record from Firestore
    const paymentRef = adminDb.collection("payments").doc(transactionId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      console.error(`Payment record not found for transaction: ${transactionId}`);
      return NextResponse.json({ message: "Payment record not found" }, { status: 404 });
    }

    const paymentData = paymentDoc.data();
    const ownerId = paymentData?.ownerId;
    const finalTier = paymentData?.planName || tier || "1 Year";

    if (status === "success") {
      // 1. Update the payment record in Firestore
      await paymentRef.update({
        status: "success",
        updated_at: new Date(),
      });

      // 2. Update owner subscription status
      const ownerRef = adminDb.collection("owners").doc(ownerId);
      await ownerRef.update({
        plan_tier: finalTier,
        subscription_status: "active",
        updated_at: new Date(),
      });

      console.log(`Successfully updated subscription for owner: ${ownerId} to tier: ${finalTier}`);
    } else {
      await paymentRef.update({
        status: "failed",
        updated_at: new Date(),
      });
      console.log(`Payment failed for transaction: ${transactionId}`);
    }

    // Check if the request is an AJAX/fetch call (JSON expected)
    const acceptHeader = req.headers.get("accept") || "";
    const isJsonRequest = acceptHeader.includes("application/json") || req.headers.get("content-type")?.includes("application/json");

    if (isJsonRequest) {
      return NextResponse.json({ 
        success: status === "success", 
        redirectUrl: "/dashboard" 
      }, { status: 200 });
    }

    // Otherwise, redirect the user directly to the dashboard
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const redirectUrl = new URL("/dashboard", `${protocol}://${host}`);
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("PhonePe callback processing error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

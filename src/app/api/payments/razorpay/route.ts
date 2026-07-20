import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { planName, price, propertyCount } = await req.json();

    const count = parseInt(propertyCount) || 1;
    if (count < 1) {
      return NextResponse.json({ message: "Invalid property count." }, { status: 400 });
    }

    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();
    const ownerData = ownerDoc?.data();
    const isUpgrade = ownerDoc?.exists && ownerData?.subscription_status === "active";
    const currentLimit = isUpgrade ? (ownerData?.property_limit || 1) : 0;

    let expectedPrice = 0;
    if (isUpgrade) {
      if (count <= currentLimit) {
        return NextResponse.json(
          { message: `Subscription already active with a limit of ${currentLimit} PG(s). Select a higher property count to upgrade.` },
          { status: 409 }
        );
      }
      const additionalCount = count - currentLimit;
      if (planName === "PGmate Starter 6 Months") {
        expectedPrice = additionalCount * 4999;
      } else if (planName === "PGmate Premium 1 Year") {
        expectedPrice = additionalCount * 6999;
      } else {
        return NextResponse.json(
          { message: "Invalid plan name." },
          { status: 400 }
        );
      }
    } else {
      if (planName === "PGmate Starter 6 Months") {
        expectedPrice = 6999 + (count - 1) * 4999;
      } else if (planName === "PGmate Premium 1 Year") {
        expectedPrice = 11999 + (count - 1) * 6999;
      } else {
        return NextResponse.json(
          { message: "Invalid plan name." },
          { status: 400 }
        );
      }
    }

    if (typeof price !== "number" || price !== expectedPrice) {
      return NextResponse.json(
        { message: `Price mismatch. Expected ₹${expectedPrice} but received ₹${price}` },
        { status: 400 }
      );
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ message: "Razorpay credentials not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    
    // Create Razorpay Order
    const orderOptions = {
      amount: expectedPrice * 100, // in paise
      currency: "INR",
      receipt: `sub_${Date.now()}`
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save transaction in DB
    await adminDb
      .collection("payments")
      .doc(order.id)
      .set({
        ownerId: session.user.id,
        transactionId: order.id,
        amount: expectedPrice,
        planName,
        propertyCount: count,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      });

    return NextResponse.json({ 
      id: order.id, 
      amount: order.amount, 
      currency: order.currency 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Razorpay subscription init error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

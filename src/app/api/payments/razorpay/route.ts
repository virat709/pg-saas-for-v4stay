import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { planName, propertyCount } = await req.json();

    const count = parseInt(propertyCount) || 1;
    if (count < 1) {
      return NextResponse.json({ message: "Invalid property count." }, { status: 400 });
    }

    const ownerDoc = await adminDb.collection("owners").doc(session.user.id).get();
    const ownerData = ownerDoc?.data();
    const isUpgrade = ownerDoc?.exists && ownerData?.subscription_status === "active";
    const currentLimit = isUpgrade ? (ownerData?.property_limit || 1) : 0;

    let basePrice = 0;
    if (isUpgrade) {
      if (planName === "30 Days Free Trial") {
        return NextResponse.json({ message: "Free trial is only available for new subscribers." }, { status: 400 });
      }
      if (count <= currentLimit) {
        return NextResponse.json(
          { message: `Subscription already active with a limit of ${currentLimit} PG(s). Select a higher property count to upgrade.` },
          { status: 409 }
        );
      }
      const additionalCount = count - currentLimit;
      if (planName === "PGmate Starter 6 Months") {
        basePrice = additionalCount * 4999;
      } else if (planName === "PGmate Premium 1 Year") {
        basePrice = additionalCount * 6999;
      } else {
        return NextResponse.json({ message: "Invalid plan name." }, { status: 400 });
      }
    } else {
      if (planName === "30 Days Free Trial" || planName === "PGmate Starter 6 Months") {
        basePrice = 6999 + (count - 1) * 4999;
      } else if (planName === "PGmate Premium 1 Year") {
        basePrice = 11999 + (count - 1) * 6999;
      } else {
        return NextResponse.json({ message: "Invalid plan name." }, { status: 400 });
      }
    }

    const expectedTotal = Math.floor(basePrice * 1.18);
    // Backend is the sole source of truth for pricing — no client-sent price needed.

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ message: "Razorpay credentials not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });
    
    // For new subscribers (!isUpgrade), attach 30-Day Free Trial via Autopay Subscription
    if (!isUpgrade) {
      let planId: string | undefined = process.env.RAZORPAY_TRIAL_PLAN_ID;
      const isYearly = planName.includes("1 Year");

      if (!planId) {
        try {
          const plan = await razorpay.plans.create({
            period: isYearly ? "yearly" : "monthly",
            interval: isYearly ? 1 : 6,
            item: {
              name: `${planName} (${count} PG limit)`,
              amount: expectedTotal * 100, // paise
              currency: "INR",
              description: `PGmate recurring subscription for ${planName}`
            }
          });
          planId = plan?.id;
        } catch (planErr: any) {
          console.warn("Dynamic plan creation note:", planErr.message || planErr);
        }
      }

      if (!planId) {
        return NextResponse.json(
          { message: "Razorpay plan ID could not be generated. Please configure RAZORPAY_TRIAL_PLAN_ID in environment variables." },
          { status: 500 }
        );
      }

      // Start billing 30 days from now (Unix timestamp in seconds)
      const startAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

      const subOptions: any = {
        plan_id: planId,
        total_count: isYearly ? 5 : 10,
        quantity: 1,
        customer_notify: 1,
        start_at: startAt,
        notes: {
          ownerId: session.user.id,
          planName,
          propertyCount: String(count)
        }
      };

      const subscription = await razorpay.subscriptions.create(subOptions);

      // Save transaction in DB
      await adminDb
        .collection("payments")
        .doc(subscription.id)
        .set({
          ownerId: session.user.id,
          transactionId: subscription.id,
          subscription_id: subscription.id,
          amount: 1,
          expected_recurring_amount: expectedTotal,
          planName,
          propertyCount: count,
          status: "pending",
          is_subscription: true,
          is_trial: true,
          created_at: new Date(),
          updated_at: new Date(),
        });

      return NextResponse.json({ 
        subscription_id: subscription.id,
        id: subscription.id, 
        amount: 100, // ₹1 mandate test fee in paise
        currency: "INR",
        is_subscription: true,
        is_trial: true
      }, { status: 200 });
    }

    // Standard Razorpay Order for property count upgrades
    const orderOptions = {
      amount: expectedTotal * 100, // in paise
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
        amount: expectedTotal,
        planName,
        propertyCount: count,
        status: "pending",
        is_upgrade: true,
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

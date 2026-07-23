import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/subscription
 *
 * Updates the owner's subscription status.
 *
 * SECURITY: This endpoint requires a server-side secret (`X-Internal-Secret`)
 * to prevent any authenticated user from calling it directly and bypassing
 * the payment flow. Only trusted server-side code (e.g., the PhonePe callback
 * handler) should call this endpoint.
 */
export async function POST(req: Request) {
  try {
    // ── Verify internal secret ─────────────────────────────────────────
    const internalSecret = process.env.INTERNAL_API_SECRET;
    const providedSecret = req.headers.get("x-internal-secret");

    if (!internalSecret) {
      console.warn(
        "[subscription] INTERNAL_API_SECRET env var is not set. " +
        "This endpoint is unprotected in production — set it immediately!"
      );
      // In dev, allow through with a warning. In prod, block.
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { message: "Server misconfiguration" },
          { status: 500 }
        );
      }
    } else if (providedSecret !== internalSecret) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // ── Verify session ─────────────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tier, status } = await req.json();

    // Whitelist allowed status values
    const ALLOWED_STATUSES = ["active", "inactive", "cancelled"];
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be one of: active, inactive, cancelled" },
        { status: 400 }
      );
    }

    const ownerRef = adminDb.collection("owners").doc(session.user.id);
    await ownerRef.update({
      plan_tier: tier,
      subscription_status: status,
      updated_at: new Date()
    });

    return NextResponse.json({ message: "Subscription updated" }, { status: 200 });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

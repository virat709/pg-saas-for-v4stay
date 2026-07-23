import { NextResponse } from "next/server";
import { processPendingRefunds } from "@/lib/refundHelper";

export async function GET(req: Request) {
  try {
    // Require cron secret authorization
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    if (!cronSecret) {
      // Allow in local dev only (no secret configured)
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ message: "CRON_SECRET not configured" }, { status: 500 });
      }
      console.warn("[CRON] Running without CRON_SECRET (development only).");
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[CRON] Unauthorized request blocked.");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const result = await processPendingRefunds();

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error: any) {
    console.error("Cron Process Refunds Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

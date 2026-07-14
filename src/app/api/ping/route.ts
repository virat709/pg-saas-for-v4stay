import { NextResponse } from "next/server";
// Keep-warm endpoint. Called every 5 minutes by Vercel cron (vercel.json)
// to prevent cold start latency on the first real user request.
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}

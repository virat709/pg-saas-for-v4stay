import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js Proxy — runs on every matching request BEFORE the page renders.
 *
 * Protection rules:
 *   /dashboard/*  — must be authenticated AND have subscription_status === "active"
 *                   ↳ not logged in  → /login
 *                   ↳ not paid       → /onboarding/subscription
 *
 * NOTE: Firestore Admin SDK is NOT available in the Edge runtime.
 * We store a lightweight `subscriptionStatus` claim inside the JWT session token
 * (written when subscription is activated). This is the fastest and correct approach
 * for Edge middleware/proxy — no cold-start latency, no Firestore in the edge.
 *
 * The token claim is refreshed by Next-Auth on every session update (see authOptions).
 */

export const config = {
  matcher: ["/dashboard/:path*"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Must be authenticated ──────────────────────────────────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
  });

  if (!token || !token.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Must have verified subscription ───────────────────────────────────
  // The token carries `subscriptionStatus` set by the jwt callback in authOptions.
  // Falls back to a Firestore check via the /api/payments/status API route when
  // the claim is absent (e.g., first login after payment on a different device).
  const subscriptionStatus = token.subscriptionStatus as string | undefined;

  if (subscriptionStatus === "active") {
    // Fast path: already verified in this JWT
    return NextResponse.next();
  }

  // Slow path: claim absent or stale — call our own API to check Firestore.
  // We make a server-side fetch to /api/payments/status using the session cookie.
  try {
    const statusUrl = new URL("/api/payments/status", request.url);
    const apiRes = await fetch(statusUrl.toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.activated === true) {
        // Payment is confirmed in DB — allow through.
        // The JWT will be refreshed with the claim on the next session call.
        return NextResponse.next();
      }
    }
  } catch (err) {
    console.error("[proxy] Subscription status check failed:", err);
    // Fail closed: redirect to subscription page on API errors to prevent
    // unpaid users from accessing the dashboard during outages.
    const subUrl = new URL("/onboarding/subscription", request.url);
    return NextResponse.redirect(subUrl);
  }

  // Not paid — redirect to subscription page
  const subUrl = new URL("/onboarding/subscription", request.url);
  return NextResponse.redirect(subUrl);
}

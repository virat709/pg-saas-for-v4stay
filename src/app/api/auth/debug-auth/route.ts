/**
 * Diagnostic endpoint — REMOVE AFTER DEBUGGING.
 * Tests each step of the auth flow independently and returns a JSON report.
 * Hit: GET /api/auth/debug-auth?token=<firebase-id-token>
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const report: Record<string, unknown> = {};

  // 1. Environment variable check
  report.env = {
    NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_BASE64: !!process.env.FIREBASE_PRIVATE_KEY_BASE64,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    NODE_VERSION: process.version,
  };

  // 2. Token verification test (only if token provided)
  if (token) {
    try {
      const { verifyFirebaseIdToken } = await import("@/lib/verifyFirebaseToken");
      const result = await verifyFirebaseIdToken(token);
      report.tokenVerification = result
        ? { ok: true, uid: result.uid, email: result.email }
        : { ok: false, reason: "verifyFirebaseIdToken returned null" };
    } catch (e: unknown) {
      report.tokenVerification = {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack?.split("\n").slice(0, 5).join(" | ") : undefined,
      };
    }
  } else {
    report.tokenVerification = "Skipped — pass ?token=<firebase-id-token> to test";
  }

  // 3. Firestore connectivity test
  try {
    const { adminDb } = await import("@/lib/firebaseAdmin");
    // Just try to read a non-existent doc — if Firestore initialised correctly, this won't throw
    await adminDb.collection("_health").doc("ping").get();
    report.firestoreConnectivity = { ok: true };
  } catch (e: unknown) {
    report.firestoreConnectivity = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // 4. Firebase REST API reachability (no token needed)
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY not set");
    // Call with a deliberately invalid token to see if the API is reachable at all
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "invalid-test-token" }),
      }
    );
    const body = await res.json();
    // A reachable API returns 400 with an error code — not a network failure
    report.firebaseRestApiReachable = {
      ok: true,
      status: res.status,
      errorFromFirebase: body?.error?.message || null,
    };
  } catch (e: unknown) {
    report.firebaseRestApiReachable = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  return NextResponse.json(report, { status: 200 });
}

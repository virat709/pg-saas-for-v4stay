/**
 * Firebase Admin SDK — Firestore + Storage only.
 * Auth token verification is handled by verifyFirebaseToken.ts (REST API)
 * to avoid the firebase-admin/auth -> jwks-rsa -> jose ESM conflict on Vercel.
 */
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let app: App;

function buildPrivateKey(): string {
  // Prefer base64-encoded key (avoids newline escaping issues in Vercel UI)
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      const decoded = Buffer.from(
        process.env.FIREBASE_PRIVATE_KEY_BASE64.trim(),
        "base64"
      ).toString("utf8");

      // Validate it looks like a PEM key
      if (!decoded.includes("-----BEGIN")) {
        console.error(
          "[firebaseAdmin] FIREBASE_PRIVATE_KEY_BASE64 decoded but does not contain PEM header. " +
          "First 40 chars of decoded value: " + decoded.substring(0, 40)
        );
        return "";
      }
      console.log("[firebaseAdmin] Private key loaded from BASE64, length:", decoded.length);
      return decoded;
    } catch (err) {
      console.error("[firebaseAdmin] Failed to base64-decode FIREBASE_PRIVATE_KEY_BASE64:", err);
      return "";
    }
  }

  // Fallback: raw key (prone to \n escaping issues when set via Vercel UI)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    let key = process.env.FIREBASE_PRIVATE_KEY;
    // Strip surrounding quotes if present
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    // Replace escaped newlines with real newlines
    key = key.replace(/\\n/g, "\n");

    if (!key.includes("-----BEGIN")) {
      console.error("[firebaseAdmin] FIREBASE_PRIVATE_KEY set but does not contain PEM header after processing.");
      return "";
    }
    console.log("[firebaseAdmin] Private key loaded from raw env, length:", key.length);
    return key;
  }

  console.error("[firebaseAdmin] Neither FIREBASE_PRIVATE_KEY nor FIREBASE_PRIVATE_KEY_BASE64 is set!");
  return "";
}

if (!getApps().length) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = buildPrivateKey();

  console.log("[firebaseAdmin] Init check — projectId:", !!projectId, "| clientEmail:", !!clientEmail, "| privateKey:", !!privateKey);

  if (projectId && clientEmail && privateKey) {
    try {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log("[firebaseAdmin] Initialized with service account credentials ✓");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[firebaseAdmin] cert()/initializeApp() threw:", msg);
      // Re-throw so the caller sees the real error instead of silently using no-auth
      throw new Error(`Firebase Admin init failed: ${msg}`);
    }
  } else {
    const missing = [
      !projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      !clientEmail && "FIREBASE_CLIENT_EMAIL",
      !privateKey && "FIREBASE_PRIVATE_KEY / FIREBASE_PRIVATE_KEY_BASE64",
    ]
      .filter(Boolean)
      .join(", ");
    console.error("[firebaseAdmin] Missing env vars:", missing, "— cannot initialize with credentials.");
    // Throw explicitly so the auth flow fails loudly, not silently
    throw new Error(`Firebase Admin cannot initialize — missing: ${missing}`);
  }
} else {
  app = getApps()[0];
  console.log("[firebaseAdmin] Reusing existing Firebase Admin app");
}

export const adminDb = getFirestore(app!);
export const adminStorage = getStorage(app!);

export default app!;

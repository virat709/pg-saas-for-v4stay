/**
 * Firebase Admin SDK — Firestore + Storage only.
 * Auth token verification is handled by verifyFirebaseToken.ts (REST API)
 * to avoid the firebase-admin/auth -> jwks-rsa -> jose ESM conflict on Vercel.
 */
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let app: App;

const hasCredentials =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_BASE64);

if (!getApps().length) {
  if (hasCredentials) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
    if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
      try {
        privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8");
      } catch (err) {
        console.error("Failed to decode FIREBASE_PRIVATE_KEY_BASE64:", err);
      }
    } else {
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    try {
      app = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      app = initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id" });
    }
  } else {
    console.warn(
      "Firebase Admin credentials not found. Initializing in fallback mode."
    );
    app = initializeApp({ projectId: "dummy-project-id" });
  }
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

export default app;

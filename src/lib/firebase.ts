import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// Safely read env variables first so Next.js Webpack inline string replacement works reliably
const envApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const envAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const envStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const envMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

const clean = (val?: string) => val ? val.replace(/['"]/g, '').trim() : undefined;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: clean(envApiKey) || "AIzaSyDummyKeyForBuilds", // Dummy fallback so build doesn't crash
  authDomain: clean(envAuthDomain) || "dummy.firebaseapp.com",
  projectId: clean(envProjectId) || "dummy-project",
  storageBucket: clean(envStorageBucket) || "dummy.appspot.com",
  messagingSenderId: clean(envMessagingSenderId) || "123456789",
  appId: clean(envAppId) || "1:123456789:web:123456789",
  measurementId: clean(envMeasurementId),
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Storage (for Tenant KYC documents and Property photos)
export const storage = getStorage(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics safely (only runs in browser environment)
export const analytics =
  typeof window !== "undefined"
    ? isSupported().then((yes) => (yes ? getAnalytics(app) : null))
    : null;

export const db = getFirestore(app);

export default app;

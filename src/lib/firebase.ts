// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.replace(/['"]/g, '').trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.replace(/['"]/g, '').trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.replace(/['"]/g, '').trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.replace(/['"]/g, '').trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.replace(/['"]/g, '').trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.replace(/['"]/g, '').trim(),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.replace(/['"]/g, '').trim(),
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

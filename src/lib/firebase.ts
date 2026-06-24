// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const cleanEnv = (val?: string) => {
  if (!val) return val;
  if (val.startsWith('"') && val.endsWith('"')) {
    return val.slice(1, -1);
  }
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1);
  }
  return val;
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

const hasClientConfig = !!firebaseConfig.apiKey;

// Initialize Firebase only once
const app = getApps().length === 0 
  ? initializeApp(
      hasClientConfig 
        ? firebaseConfig 
        : {
            apiKey: "dummy-api-key",
            authDomain: "dummy.firebaseapp.com",
            projectId: "dummy-project",
            storageBucket: "dummy.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:123456789",
          }
    ) 
  : getApps()[0];

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

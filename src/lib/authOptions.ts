import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyFirebaseIdToken } from "@/lib/verifyFirebaseToken";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        action: { label: "Action", type: "text" }
      },
      async authorize(credentials) {
        const step = { current: "start" };
        try {
          // ── STEP 1: Validate input ────────────────────────────────────────
          step.current = "validate-input";
          if (!credentials?.idToken) {
            console.error("[AUTH][FAIL] No idToken received in credentials");
            return null;
          }
          console.log("[AUTH][1] idToken received, length:", credentials.idToken.length);

          // ── STEP 2: Verify Firebase ID token via REST API ─────────────────
          step.current = "verify-token";
          console.log("[AUTH][2] Calling verifyFirebaseIdToken...");
          const decodedToken = await verifyFirebaseIdToken(credentials.idToken);

          if (!decodedToken) {
            console.error("[AUTH][FAIL] verifyFirebaseIdToken returned null — token invalid or API key missing");
            return null;
          }
          console.log("[AUTH][2] Token verified OK. uid:", decodedToken.uid, "| email:", decodedToken.email);

          const { uid, email, name: tokenName } = decodedToken;

          // ── STEP 3: Initialize Firestore via firebase-admin ───────────────
          step.current = "init-firestore";
          console.log("[AUTH][3] Importing adminDb...");
          const { adminDb } = await import("@/lib/firebaseAdmin");
          console.log("[AUTH][3] adminDb imported OK");

          // ── STEP 4: Firestore read/write ──────────────────────────────────
          step.current = "firestore-read";
          const ownersRef = adminDb.collection("owners");
          console.log("[AUTH][4] Reading owner doc for uid:", uid);
          const ownerDoc = await ownersRef.doc(uid).get();
          console.log("[AUTH][4] Doc exists:", ownerDoc.exists);

          let ownerData: Record<string, unknown> | null = null;

          if (!ownerDoc.exists) {
            step.current = "firestore-write";
            ownerData = {
              email: email || "",
              name: credentials.name || tokenName || "Owner",
              phone: credentials.phone || "",
              created_at: new Date(),
              updated_at: new Date(),
            };
            console.log("[AUTH][5] Writing new owner doc...");
            await ownersRef.doc(uid).set(ownerData);
            console.log("[AUTH][5] Owner doc created OK");
          } else {
            ownerData = ownerDoc.data() as Record<string, unknown>;
            console.log("[AUTH][5] Existing owner loaded:", ownerData?.email);
          }

          // ── STEP 5: Return session user ───────────────────────────────────
          const user = {
            id: uid,
            email: (ownerData?.email as string) || email || "",
            name: (ownerData?.name as string) || tokenName || "Owner",
          };
          console.log("[AUTH][OK] authorize() returning user:", user.email);
          return user;

        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error(`[AUTH][ERROR] Failed at step "${step.current}":`, err.message);
          console.error("[AUTH][STACK]", err.stack?.split("\n").slice(0, 6).join(" | "));
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, trigger }) {
      // Time-based check to prevent querying Firestore on every single API request.
      const now = Date.now();
      const lastChecked = (token.lastCheckedSub as number) || 0;

      // Check DB if:
      // a) Explicitly updated (trigger === "update")
      // b) No subscription status in token
      // c) Inactive and checked > 30s ago (to detect fast updates)
      // d) Active and checked > 5 minutes ago (for sanity refresh)
      const shouldCheck =
        trigger === "update" ||
        !token.subscriptionStatus ||
        (token.subscriptionStatus !== "active" && now - lastChecked > 30000) ||
        (token.subscriptionStatus === "active" && now - lastChecked > 300000);

      if (token.sub && shouldCheck) {
        try {
          const { adminDb } = await import("@/lib/firebaseAdmin");
          const ownerDoc = await adminDb.collection("owners").doc(token.sub).get();
          if (ownerDoc.exists) {
            const data = ownerDoc.data();
            token.subscriptionStatus = data?.subscription_status ?? "inactive";
            token.lastCheckedSub = now;
            console.log(`[AUTH][JWT] Refreshed subscription status: ${token.subscriptionStatus}`);
          }
        } catch (err) {
          console.error("[AUTH][JWT] Failed to read subscription status:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        // Expose subscriptionStatus to client session (non-sensitive metadata)
        session.user.subscriptionStatus = token.subscriptionStatus as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

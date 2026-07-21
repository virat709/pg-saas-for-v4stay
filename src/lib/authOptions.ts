import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyFirebaseIdToken } from "@/lib/verifyFirebaseToken";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" },
        action: { label: "Action", type: "text" },
        // Staff login fields
        staffEmail: { label: "Staff Email", type: "text" },
        staffPassword: { label: "Staff Password", type: "password" },
        staffPropertyId: { label: "Staff Property ID", type: "text" }
      },
      async authorize(credentials) {
        // ── STAFF LOGIN PATH ─────────────────────────────────────────────
        if (credentials?.staffEmail && credentials?.staffPassword && credentials?.staffPropertyId) {
          try {
            const { adminDb } = await import("@/lib/firebaseAdmin");
            const sSnap = await adminDb
              .collection("properties")
              .doc(credentials.staffPropertyId)
              .collection("staff")
              .where("email", "==", credentials.staffEmail.toLowerCase().trim())
              .limit(1)
              .get();

            if (sSnap.empty) {
              console.error("[AUTH][STAFF] Email not found");
              return null;
            }

            const staffDoc = sSnap.docs[0];
            const staffData = staffDoc.data();
            const valid = await bcrypt.compare(credentials.staffPassword, staffData.password_hash);
            if (!valid) {
              console.error("[AUTH][STAFF] Wrong password");
              return null;
            }

            return {
              id: staffDoc.id,
              name: staffData.name,
              email: staffData.email,
              role: "staff",
              staffPropertyId: credentials.staffPropertyId,
            };
          } catch (err) {
            console.error("[AUTH][STAFF] Error:", err);
            return null;
          }
        }
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
    async jwt({ token, user, trigger }) {
      // Persist staff role into JWT on first sign-in
      if (user && (user as any).role === "staff") {
        token.role = "staff";
        token.staffPropertyId = (user as any).staffPropertyId;
        token.subscriptionStatus = "active"; // staff bypasses sub check
        return token;
      }
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
            let status = data?.subscription_status ?? "inactive";

            // Plan expiration check:
            if (status === "active") {
              const activatedAtVal = data?.subscription_activated_at;
              const activatedAt = activatedAtVal
                ? typeof activatedAtVal === "object" && activatedAtVal.seconds
                  ? new Date(activatedAtVal.seconds * 1000)
                  : new Date(activatedAtVal)
                : null;

              const planTier = data?.plan_tier || data?.subscription_plan || "No Active Plan";
              const planTierLower = planTier.toLowerCase();
              let durationMonths = 0;
              if (planTierLower.includes("6 months") || planTierLower.includes("starter")) {
                durationMonths = 6;
              } else if (planTierLower.includes("1 year") || planTierLower.includes("premium")) {
                durationMonths = 12;
              }

              if (activatedAt && durationMonths > 0) {
                const expiresAt = new Date(activatedAt);
                expiresAt.setMonth(expiresAt.getMonth() + durationMonths);
                if (Date.now() > expiresAt.getTime()) {
                  status = "inactive"; // plan expired
                }
              }
              // If we can't determine duration/start date, keep status as active (benefit of doubt)
            }

            token.subscriptionStatus = status;
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
        session.user.subscriptionStatus = token.subscriptionStatus as string | undefined;
        // Expose staff role to client
        if (token.role) {
          (session.user as any).role = token.role;
          (session.user as any).staffPropertyId = token.staffPropertyId;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  // WARNING: The fallback secret is for local development ONLY.
  // In production, NEXTAUTH_SECRET must be set to a strong random value.
  secret: process.env.NEXTAUTH_SECRET,
};

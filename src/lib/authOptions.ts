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
        if (!credentials?.idToken) {
          return null;
        }

        try {
          // Verify token via Firebase REST API (no firebase-admin/auth → no ESM conflict)
          const decodedToken = await verifyFirebaseIdToken(credentials.idToken);

          if (!decodedToken) {
            console.error("[AUTH] Token verification returned null.");
            return null;
          }

          const { uid, email, name: tokenName } = decodedToken;

          // Firestore operations still use firebase-admin/firestore (no ESM issue)
          const { adminDb } = await import("@/lib/firebaseAdmin");
          const ownersRef = adminDb.collection("owners");
          const ownerDoc = await ownersRef.doc(uid).get();

          let ownerData: Record<string, unknown> | null = null;

          if (!ownerDoc.exists) {
            ownerData = {
              email: email || "",
              name: credentials.name || tokenName || "Owner",
              phone: credentials.phone || "",
              created_at: new Date(),
              updated_at: new Date(),
            };
            await ownersRef.doc(uid).set(ownerData);
          } else {
            ownerData = ownerDoc.data() as Record<string, unknown>;
          }

          return {
            id: uid,
            email: (ownerData?.email as string) || email || "",
            name: (ownerData?.name as string) || tokenName || "Owner",
          };
        } catch (error) {
          console.error("[AUTH] Error during authorization:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
};

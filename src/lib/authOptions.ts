import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
          console.log("[AUTH DEBUG] Init credentials verification:", {
            hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            hasPrivateKeyBase64: !!process.env.FIREBASE_PRIVATE_KEY_BASE64,
          });

          const { adminAuth, adminDb } = await import("@/lib/firebaseAdmin");
          const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
          const { uid, email, name: tokenName } = decodedToken;

          const ownersRef = adminDb.collection("owners");
          const ownerDoc = await ownersRef.doc(uid).get();

          let ownerData: any = null;

          if (!ownerDoc.exists) {
            // Check if it's a registration action or Google Sign-In where we auto-create
            ownerData = {
              email: email || credentials.email || "",
              name: credentials.name || tokenName || "Owner",
              phone: credentials.phone || "",
              created_at: new Date(),
              updated_at: new Date(),
            };
            await ownersRef.doc(uid).set(ownerData);
          } else {
            ownerData = ownerDoc.data();
          }

          return {
            id: uid,
            email: ownerData?.email || email,
            name: ownerData?.name || tokenName,
          };
        } catch (error) {
          console.error("Firebase auth verification error:", error);
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

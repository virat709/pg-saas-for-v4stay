/**
 * Verifies a Firebase ID token using Google's Identity Toolkit REST API.
 * This approach avoids importing firebase-admin/auth (which pulls in jwks-rsa/jose ESM modules
 * that cause ERR_REQUIRE_ESM errors on Vercel's bundler).
 *
 * Uses NEXT_PUBLIC_FIREBASE_API_KEY (public key, safe for server-side use too).
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<{
  uid: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
} | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    console.error("[verifyFirebaseIdToken] NEXT_PUBLIC_FIREBASE_API_KEY is not set.");
    return null;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("[verifyFirebaseIdToken] Token verification failed:", errorBody);
      return null;
    }

    const data = await response.json();
    const user = data?.users?.[0];

    if (!user) {
      console.error("[verifyFirebaseIdToken] No user found in response.");
      return null;
    }

    return {
      uid: user.localId,
      email: user.email,
      name: user.displayName,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error("[verifyFirebaseIdToken] Error calling Firebase REST API:", error);
    return null;
  }
}

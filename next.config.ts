import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Keep firebase-admin, jwks-rsa, and jose as external packages so Next.js/Turbopack
  // never tries to bundle them. Node.js loads them directly at runtime, bypassing the
  // Turbopack external-module loader that triggers the ERR_REQUIRE_ESM crash.
  serverExternalPackages: [
    "firebase-admin",
    "jwks-rsa",
    "jose",
    "google-auth-library",
    "googleapis",
  ],
};

export default nextConfig;

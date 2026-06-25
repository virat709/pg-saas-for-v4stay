import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
};

export default nextConfig;

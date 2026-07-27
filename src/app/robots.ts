import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://pg.v4stay.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/contact-us",
          "/register",
          "/login",
          "/staff-login",
          "/privacy-policy",
          "/terms-and-conditions",
          "/refund-policy",
          "/sitemap.xml",
        ],
        disallow: [
          "/api/*",
          "/dashboard/*",
          "/onboarding/*",
          "/demo/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/*", "/dashboard/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | PGmate",
  description: "Sign in to your PGmate owner dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://pg.v4stay.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Login",
        "item": "https://pg.v4stay.com/login"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}

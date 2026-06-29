import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | PGmate",
  description: "Reset your PGmate owner account password.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
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
        "name": "Reset Password",
        "item": "https://pg.v4stay.com/forgot-password"
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

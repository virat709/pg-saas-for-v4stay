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
        "item": "https://pgmate.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Reset Password",
        "item": "https://pgmate.in/forgot-password"
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

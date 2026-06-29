import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | PGmate",
  description: "Read the refund and cancellation policy of the PGmate platform.",
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
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
        "name": "Refund Policy",
        "item": "https://pg.v4stay.com/refund-policy"
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

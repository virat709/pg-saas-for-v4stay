import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PGmate - Paying Guest (PG) Management System & Software",
  description: "Scale and monetize your PG accommodation with PGmate. Automate rent tracking, generate digital receipts, offer a premium tenant portal, and manage complaints.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PGmate",
  },
};

export const viewport: Viewport = {
  themeColor: "#00c49f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://pgmate.in/#organization",
        "name": "V4Stay",
        "url": "https://pgmate.in",
        "logo": "https://pgmate.in/logo-light.png"
      },
      {
        "@type": "WebSite",
        "@id": "https://pgmate.in/#website",
        "url": "https://pgmate.in",
        "name": "PGmate",
        "description": "Smart Paying Guest (PG) Management System & Software",
        "publisher": {
          "@id": "https://pgmate.in/#organization"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://pgmate.in/#software",
        "name": "PGmate",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "category": "PG Management Software",
        "publisher": {
          "@id": "https://pgmate.in/#organization"
        },
        "offers": {
          "@type": "Offer",
          "price": "6999",
          "priceCurrency": "INR",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "6999",
            "priceCurrency": "INR",
            "referenceQuantity": {
              "@type": "QuantitativeValue",
              "value": "6",
              "unitCode": "MON"
            }
          }
        }
      }
    ]
  };

  return (
    <html lang="en">
      <body className={poppins.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

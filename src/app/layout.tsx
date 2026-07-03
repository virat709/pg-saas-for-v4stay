import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

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

import { ThemeProvider } from "@/context/ThemeContext";

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
        "@id": "https://pg.v4stay.com/#organization",
        "name": "V4Stay",
        "url": "https://pg.v4stay.com",
        "logo": "https://pg.v4stay.com/logo-light.png"
      },
      {
        "@type": "WebSite",
        "@id": "https://pg.v4stay.com/#website",
        "url": "https://pg.v4stay.com",
        "name": "PGmate",
        "description": "Smart Paying Guest (PG) Management System & Software",
        "publisher": {
          "@id": "https://pg.v4stay.com/#organization"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://pg.v4stay.com/#software",
        "name": "PGmate",
        "operatingSystem": "All",
        "applicationCategory": "BusinessApplication",
        "category": "PG Management Software",
        "publisher": {
          "@id": "https://pg.v4stay.com/#organization"
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('pgmate-theme') || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', resolved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={poppins.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

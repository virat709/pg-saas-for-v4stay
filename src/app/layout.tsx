import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pg.v4stay.com"),
  title: {
    default: "PGmate | #1 PG Management Software & Hostel App for PG Owners",
    template: "%s | PGmate - PG Management Software",
  },
  description:
    "PGmate is India's leading Paying Guest (PG) management software for PG owners and hostel managers. Automate rent collection, generate instant digital payment receipts, manage tenant room allocation, handle complaints, and track property expenses effortlessly.",
  keywords: [
    "PG",
    "PG management",
    "PG owner",
    "PG management software",
    "paying guest software",
    "hostel management app",
    "PG rent tracker",
    "PG management system India",
    "best PG software",
    "PG owner app",
    "PG tenant portal",
    "PG maintenance software",
    "paying guest management system",
    "hostel management software India",
    "PG rent collection app",
    "PG accommodation management",
  ],
  authors: [{ name: "V4Stay", url: "https://pg.v4stay.com" }],
  creator: "V4Stay",
  publisher: "V4Stay",
  alternates: {
    canonical: "https://pg.v4stay.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "PGmate | #1 PG Management Software & Hostel App for PG Owners",
    description:
      "Automate rent collection, tenant portals, digital receipts, and property operations with PGmate - India's smartest PG management software.",
    url: "https://pg.v4stay.com",
    siteName: "PGmate",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://pg.v4stay.com/icon.svg",
        width: 1200,
        height: 630,
        alt: "PGmate PG Management Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PGmate | #1 PG Management Software for PG Owners",
    description:
      "India's smartest PG management app for PG owners and hostel managers. Automate rent tracking, receipts, and tenant operations.",
    images: ["https://pg.v4stay.com/icon.svg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon.ico?v=3" },
    ],
    shortcut: "/icon.svg?v=3",
    apple: "/icon.svg?v=3",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PGmate",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

import PwaInstallPrompt from "@/components/PwaInstallPrompt";

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
        "logo": "https://pg.v4stay.com/icon.svg",
        "sameAs": ["https://pg.v4stay.com"]
      },
      {
        "@type": "WebSite",
        "@id": "https://pg.v4stay.com/#website",
        "url": "https://pg.v4stay.com",
        "name": "PGmate",
        "description": "Smart Paying Guest (PG) Management System & Software for PG Owners",
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
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "285",
          "reviewCount": "285"
        },
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "0",
          "highPrice": "11999",
          "priceCurrency": "INR",
          "offerCount": "3"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://pg.v4stay.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is PGmate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PGmate is an all-in-one Paying Guest (PG) management software and mobile app designed for PG owners and hostel managers to automate rent tracking, tenant onboarding, complaints, and digital receipts."
            }
          },
          {
            "@type": "Question",
            "name": "How does PGmate help PG owners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PGmate automates monthly rent reminders, generates instant WhatsApp payment receipts, manages room & bed allocations, locks out overdue accounts, and tracks overall property expenses."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a free trial for PG owners?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! PGmate offers a 30-day full feature free trial for all new PG owners with no credit card required."
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1P4KX7R5CE"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1P4KX7R5CE');
          `}
        </Script>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <PwaInstallPrompt />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

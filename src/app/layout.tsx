import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | PGmate",
  description: "Discover how PGmate simplifies Paying Guest operations for accommodation owners across India.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

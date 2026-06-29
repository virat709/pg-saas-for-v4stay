import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | PGmate",
  description: "Read the terms and conditions of using the PGmate platform.",
};

export default function TermsAndConditionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

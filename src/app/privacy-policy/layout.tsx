import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PGmate",
  description: "Read the privacy policy of the PGmate platform.",
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

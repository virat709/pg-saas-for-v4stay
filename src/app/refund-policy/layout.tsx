import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | PGmate",
  description: "Read the refund and cancellation policy of the PGmate platform.",
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

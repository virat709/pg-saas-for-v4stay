import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | PGmate",
  description: "Reset your PGmate owner account password.",
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

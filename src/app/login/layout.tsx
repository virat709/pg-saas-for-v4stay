import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | PGmate",
  description: "Sign in to your PGmate owner dashboard.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

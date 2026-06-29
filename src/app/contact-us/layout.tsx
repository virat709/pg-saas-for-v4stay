import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | PGmate",
  description: "Contact the PGmate support and sales team for help, billing inquiries, or feature requests.",
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

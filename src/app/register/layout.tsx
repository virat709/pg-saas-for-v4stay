import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register your PG | PGmate",
  description: "Start managing your PG properties, rooms, and tenants with PGmate.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

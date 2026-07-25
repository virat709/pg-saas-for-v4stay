import type { Metadata } from "next";
import DemoLayoutClient from "./DemoLayoutClient";

export const metadata: Metadata = {
  title: "PGmate | Live Demo Dashboard",
  description: "Explore PGmate features in an interactive live demo preview with sample PG data.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoLayoutClient>{children}</DemoLayoutClient>;
}

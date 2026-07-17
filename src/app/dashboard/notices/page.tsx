import { redirect } from "next/navigation";
export default function NoticesRedirect() {
  redirect("/dashboard/complaints");
}

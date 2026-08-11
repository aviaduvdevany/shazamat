import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminRoot() {
  const ok = await isAuthenticated();
  if (!ok) redirect("/admin/login");
  redirect("/admin/shows");
}

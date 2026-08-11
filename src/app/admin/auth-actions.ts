"use server";

import { redirect } from "next/navigation";
import { checkCredentials, createSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!checkCredentials(username, password)) {
    redirect("/admin/login?error=1");
  }

  const token = await createSession();
  await setSessionCookie(token);
  redirect("/admin/shows");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

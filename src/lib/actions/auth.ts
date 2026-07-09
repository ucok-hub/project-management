"use server";

import { redirect } from "next/navigation";
import { verifyCredentials, createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Isi username dan password ya." };
  }

  const user = await verifyCredentials(username, password);
  if (!user) {
    return { error: "Username atau password salah." };
  }

  const remember = formData.get("remember") != null;
  await createSession(user.id, remember);
  redirect("/beranda");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/masuk");
}

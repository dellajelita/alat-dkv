"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/auth";

export type LoginActionState = {
  error?: string;
};

export async function loginAdmin(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const password = String(formData.get("password") ?? "");

  if (!password.trim()) {
    return { error: "Kata sandi admin wajib diisi." };
  }

  if (!verifyAdminPassword(password)) {
    return { error: "Kata sandi admin salah." };
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/login");
}

"use server";

import { cookies } from "next/headers";
import type { AuthUser } from "./api/auth";

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    path: "/",
    sameSite: "lax",
  });
}

export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function storeUserData(userData: AuthUser) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(userData),
    path: "/",
    sameSite: "lax",
  });
}

export async function getUserData() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data")?.value;

  if (!userDataCookie) return null;

  try {
    return JSON.parse(userDataCookie) as AuthUser;
  } catch {
    return null;
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
}

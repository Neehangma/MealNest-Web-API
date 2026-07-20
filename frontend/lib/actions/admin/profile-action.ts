"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearAuthCookies, getTokenCookie, storeUserData } from "@/lib/cookies";
import { AdminApiError } from "@/lib/api/admin/user";
import { getAdminProfile, updateAdminProfile } from "@/lib/api/admin/profile";
import { isOptionalPhoneNumberValid, PHONE_VALIDATION_MESSAGE } from "@/lib/phone-validation";

async function tokenOrRedirect() {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  return token;
}

function handle(error: unknown): never {
  if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
  throw error;
}

export async function getAdminProfileAction() {
  const token = await tokenOrRedirect();
  try { return await getAdminProfile(token); }
  catch (error) {
    if (error instanceof AdminApiError && error.status === 401) { await clearAuthCookies(); redirect("/login"); }
    handle(error);
  }
}

export async function updateAdminProfileAction(data: FormData) {
  if (!isOptionalPhoneNumberValid(String(data.get("phoneNumber") || ""))) throw new Error(PHONE_VALIDATION_MESSAGE);
  const token = await tokenOrRedirect();
  try {
    const response = await updateAdminProfile(data, token);
    await storeUserData(response.admin);
    revalidatePath("/admin/settings");
    revalidatePath("/admin", "layout");
    return response;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) { await clearAuthCookies(); redirect("/login"); }
    handle(error);
  }
}

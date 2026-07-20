"use server";

import { API } from "@/lib/api/endpoints";
import type { AuthUser } from "@/lib/api/auth";
import { clearAuthCookies, getTokenCookie, storeUserData } from "@/lib/cookies";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { isOptionalPhoneNumberValid, PHONE_VALIDATION_MESSAGE } from "@/lib/phone-validation";

export type ProfileActionState = {
  success: boolean;
  message: string;
  user?: AuthUser;
};

type ActionState = ProfileActionState;

type ProfileUpdateResponse = {
  success: boolean;
  message: string;
  user: AuthUser;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function authedRequest<T>(path: string, init: RequestInit) {
  const token = await getTokenCookie();

  if (!token) {
    throw new Error("Please log in again");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body as T;
}

export async function updateProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") || "").trim();
  const profilePicture = String(formData.get("profilePicture") || "");
  const location = String(formData.get("location") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  if (!fullName) {
    return { success: false, message: "Full name is required" };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address" };
  }

  if (!isOptionalPhoneNumberValid(phoneNumber)) {
    return { success: false, message: PHONE_VALIDATION_MESSAGE };
  }

  try {
    const result = await authedRequest<ProfileUpdateResponse>(API.PROFILE.UPDATE, {
      method: "PATCH",
      body: JSON.stringify({
        fullName,
        email,
        phoneNumber,
        profilePicture,
        location,
        bio,
      }),
    });

    await storeUserData(result.user);
    revalidatePath("/profile");
    revalidatePath("/dashboard/user");

    return { success: true, message: result.message || "Profile updated successfully", user: result.user };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Unable to update profile"),
    };
  }
}

export async function changePasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!currentPassword) {
    return { success: false, message: "Current password is required" };
  }

  if (!isPasswordValid(newPassword)) {
    return { success: false, message: PASSWORD_POLICY_MESSAGE };
  }

  if (currentPassword === newPassword) {
    return { success: false, message: "New password must be different from the current password." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New password and confirm password do not match." };
  }

  try {
    const result = await authedRequest<{ success: boolean; message: string }>(API.PROFILE.PASSWORD, {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    await clearAuthCookies();
    return { success: true, message: result.message || "Password changed successfully. Please log in again using your new password." };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Password could not be changed. Please try again."),
    };
  }
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/");
}

"use server";

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  type UserListParams,
  type UserPayload,
  AdminApiError,
} from "@/lib/api/admin";
import { clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { redirect } from "next/navigation";
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { isOptionalPhoneNumberValid, PHONE_VALIDATION_MESSAGE } from "@/lib/phone-validation";

async function getAdminToken() {
  const token = await getTokenCookie();

  if (!token) {
    await clearAuthCookies();
    redirect("/login");
  }

  return token as string;
}

async function runAdminRequest<T>(request: (token: string) => Promise<T>) {
  try {
    return await request(await getAdminToken());
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      await clearAuthCookies();
      redirect("/login");
    }
    if (error instanceof AdminApiError && error.status === 403) {
      throw new Error("Admin access required");
    }
    throw error;
  }
}

export async function getAdminUsersAction(params: UserListParams = {}) {
  return runAdminRequest((token) => getUsers(params, token));
}

export async function getAdminUserByIdAction(id: string) {
  return runAdminRequest((token) => getUserById(id, token));
}

export async function createAdminUserAction(data: UserPayload & { password: string }) {
  if (!isOptionalPhoneNumberValid(data.phoneNumber || "")) throw new Error(PHONE_VALIDATION_MESSAGE);
  if (!isPasswordValid(data.password)) throw new Error(PASSWORD_POLICY_MESSAGE);
  return runAdminRequest((token) => createUser(data, token));
}

export async function updateAdminUserAction(id: string, data: Partial<UserPayload>) {
  if (!isOptionalPhoneNumberValid(data.phoneNumber || "")) throw new Error(PHONE_VALIDATION_MESSAGE);
  if (data.password && !isPasswordValid(data.password)) throw new Error(PASSWORD_POLICY_MESSAGE);
  return runAdminRequest((token) => updateUser(id, data, token));
}

export async function deleteAdminUserAction(id: string) {
  return runAdminRequest((token) => deleteUser(id, token));
}

"use server";

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  type UserListParams,
  type UserPayload,
} from "@/lib/api/admin";
import { getTokenCookie } from "@/lib/cookies";

async function getAdminToken() {
  const token = await getTokenCookie();

  if (!token) {
    throw new Error("You must be logged in as an admin.");
  }

  return token;
}

export async function getAdminUsersAction(params: UserListParams = {}) {
  return getUsers(params, await getAdminToken());
}

export async function getAdminUserByIdAction(id: string) {
  return getUserById(id, await getAdminToken());
}

export async function createAdminUserAction(data: UserPayload & { password: string }) {
  return createUser(data, await getAdminToken());
}

export async function updateAdminUserAction(id: string, data: Partial<UserPayload>) {
  return updateUser(id, data, await getAdminToken());
}

export async function deleteAdminUserAction(id: string) {
  return deleteUser(id, await getAdminToken());
}

import type { AuthUser } from "../auth";
import { API } from "../endpoints";
import { adminRequest } from "./user";

export function getAdminProfile(token?: string) {
  return adminRequest<{ success: boolean; admin: AuthUser }>(API.ADMIN.PROFILE, {}, token);
}

export function updateAdminProfile(data: FormData, token?: string) {
  return adminRequest<{ success: boolean; message: string; admin: AuthUser }>(API.ADMIN.PROFILE, { method: "PUT", body: data }, token);
}

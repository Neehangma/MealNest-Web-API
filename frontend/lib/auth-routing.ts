import type { AuthUser } from "./api/auth";

export function getDashboardPathForRole(role?: AuthUser["role"]) {
  return role === "admin" ? "/admin" : "/dashboard/user";
}

import type { AuthUser } from "./api/auth";

export function getDashboardPathForRole(role?: AuthUser["role"]) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "user":
      return "/dashboard/user";
    default:
      return "/login";
  }
}

"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { AdminApiError } from "@/lib/api/admin/user";
import { getAdminDashboardStats } from "@/lib/api/admin/dashboard";

export async function getAdminDashboardStatsAction() {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  try { return await getAdminDashboardStats(token); }
  catch (error) {
    if (error instanceof AdminApiError && error.status === 401) { await clearAuthCookies(); redirect("/login"); }
    if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
    throw error;
  }
}

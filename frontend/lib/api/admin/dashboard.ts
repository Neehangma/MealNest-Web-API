import { API } from "../endpoints";
import { adminRequest } from "./user";

export type AdminDashboardStats = { totalUsers: number; totalRestaurants: number; totalBookings: number };
export type AdminActivity = { type: "user" | "restaurant" | "booking"; title: string; text: string; createdAt: string };
export type AdminDashboardResponse = { success: boolean; stats: AdminDashboardStats; activities: AdminActivity[] };

export function getAdminDashboardStats(token?: string) {
  return adminRequest<AdminDashboardResponse>(API.ADMIN.DASHBOARD_STATS, { cache: "no-store" }, token);
}

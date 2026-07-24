import { API } from "../endpoints";
import { adminRequest } from "./user";

export type AdminDashboardStats = { totalUsers: number; totalRestaurants: number; totalBookings: number };
export type AdminActivity = { type: "user" | "restaurant" | "booking"; title: string; text: string; createdAt: string };
export type AdminDashboardResponse = { success: boolean; stats: AdminDashboardStats; activities: AdminActivity[] };
export type AnalyticsRange = "7d" | "30d" | "6m";
export type AnalyticsPoint = { label: string; count: number };
export type BookingStatusPoint = { status: "pending" | "confirmed" | "completed" | "cancelled"; count: number };
export type CuisinePoint = { cuisine: string; count: number };
export type TopRestaurant = {
  restaurantId: string;
  name: string;
  cuisine: string;
  image: string;
  bookingCount: number;
};
export type AdminAnalyticsResponse = {
  success: boolean;
  summary: AdminDashboardStats;
  bookingTrends: AnalyticsPoint[];
  userGrowth: AnalyticsPoint[];
  bookingStatuses: BookingStatusPoint[];
  restaurantsByCuisine: CuisinePoint[];
  topRestaurants: TopRestaurant[];
};

export function getAdminDashboardStats(token?: string) {
  return adminRequest<AdminDashboardResponse>(API.ADMIN.DASHBOARD_STATS, { cache: "no-store" }, token);
}

export function getAdminAnalytics(range: AnalyticsRange, token?: string) {
  const query = new URLSearchParams({ range });
  if (token) {
    return adminRequest<AdminAnalyticsResponse>(
      `${API.ADMIN.ANALYTICS}?${query.toString()}`,
      { cache: "no-store" },
      token
    );
  }

  return fetch(`/api/admin/analytics?${query.toString()}`, { cache: "no-store" })
    .then(async (response) => {
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Unable to load analytics.");
      return body as AdminAnalyticsResponse;
    });
}

"use server";

import { API } from "@/lib/api/endpoints";
import type { DashboardData, FavoriteRestaurant } from "@/lib/api/dashboard";
import { getTokenCookie } from "@/lib/cookies";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

async function authedRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getTokenCookie();
  if (!token) throw new Error("Please log in again");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || "Favorite request failed");
  return body as T;
}

type DashboardEnvelope = Partial<DashboardData> & { data?: DashboardData };
type FavoriteEnvelope = { data?: { favorites?: FavoriteRestaurant[] }; favorites?: FavoriteRestaurant[] };

export async function getUserDashboardAction(): Promise<DashboardData> {
  const response = await authedRequest<DashboardEnvelope>(API.DASHBOARD.GET);
  const dashboard = response.data || response;
  return {
    stats: dashboard.stats || { bookings: 0, favorites: 0, averageRating: 0 },
    favorites: dashboard.favorites || [],
    upcomingReservations: dashboard.upcomingReservations || [],
    recentHistory: dashboard.recentHistory || [],
    cancelledReservations: dashboard.cancelledReservations || [],
  };
}

export async function getFavoritesAction() {
  return (await getUserDashboardAction()).favorites;
}

export async function toggleFavoriteAction(restaurantId: string) {
  const response = await authedRequest<FavoriteEnvelope>(API.FAVORITES.TOGGLE(restaurantId), { method: "POST" });
  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/user/favorites");
  return response.data?.favorites || response.favorites || [];
}

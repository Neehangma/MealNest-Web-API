"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { AdminApiError, createRestaurant, deleteRestaurant, getAdminRestaurants, updateRestaurant, type RestaurantListParams, type RestaurantPayload } from "@/lib/api/admin";

async function withAdminToken<T>(request: (token: string) => Promise<T>) {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  try {
    return await request(token);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      await clearAuthCookies();
      redirect("/login");
    }
    if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
    throw error;
  }
}

export async function getAdminRestaurantsAction(params: RestaurantListParams = {}) {
  return withAdminToken((token) => getAdminRestaurants(params, token));
}
export async function createRestaurantAction(data: RestaurantPayload) {
  return withAdminToken((token) => createRestaurant(data, token));
}
export async function updateRestaurantAction(id: string, data: Partial<RestaurantPayload>) {
  return withAdminToken((token) => updateRestaurant(id, data, token));
}
export async function deleteRestaurantAction(id: string) {
  return withAdminToken((token) => deleteRestaurant(id, token));
}

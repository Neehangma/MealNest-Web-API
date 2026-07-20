"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { AdminApiError, createRestaurant, deleteRestaurant, getAdminRestaurants, updateRestaurant, type RestaurantListParams } from "@/lib/api/admin";
import { isPhoneNumberValid, PHONE_VALIDATION_MESSAGE } from "@/lib/phone-validation";

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
export async function createRestaurantAction(data: FormData) {
  if (!isPhoneNumberValid(String(data.get("phone") || ""))) throw new Error(PHONE_VALIDATION_MESSAGE);
  return withAdminToken((token) => createRestaurant(data, token));
}
export async function updateRestaurantAction(id: string, data: FormData) {
  if (data.has("phone") && !isPhoneNumberValid(String(data.get("phone") || ""))) throw new Error(PHONE_VALIDATION_MESSAGE);
  return withAdminToken((token) => updateRestaurant(id, data, token));
}
export async function deleteRestaurantAction(id: string) {
  return withAdminToken((token) => deleteRestaurant(id, token));
}

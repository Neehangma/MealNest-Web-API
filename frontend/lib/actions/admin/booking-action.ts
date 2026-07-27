"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { AdminApiError } from "@/lib/api/admin/user";
import {
  completeAdminBooking,
  getAdminBookings,
  getAdminRestaurantBookings,
  getGroupedAdminBookings,
  type GroupedBookingParams,
} from "@/lib/api/admin/booking";

export async function getAdminBookingsAction() {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  try {
    return await getAdminBookings(token);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      await clearAuthCookies();
      redirect("/login");
    }
    if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
    throw error;
  }
}

export async function getGroupedAdminBookingsAction(params: GroupedBookingParams = {}) {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  try {
    return await getGroupedAdminBookings(params, token);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      await clearAuthCookies();
      redirect("/login");
    }
    if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
    throw error;
  }
}

export async function getAdminRestaurantBookingsAction(restaurantId: string) {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  try {
    return await getAdminRestaurantBookings(restaurantId, token);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      await clearAuthCookies();
      redirect("/login");
    }
    if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
    throw error;
  }
}

export async function completeAdminBookingAction(reservationId: string) {
  const token = await getTokenCookie();
  if (!token) redirect("/login");
  try {
    return await completeAdminBooking(reservationId, token);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      await clearAuthCookies();
      redirect("/login");
    }
    if (error instanceof AdminApiError && error.status === 403) throw new Error("Admin access required");
    throw error;
  }
}

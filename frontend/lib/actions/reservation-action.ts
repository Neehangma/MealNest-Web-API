"use server";

import { API } from "@/lib/api/endpoints";
import type { DashboardResponse, ReservationCreateResponse, ReservationItem, ReservationMutationResponse } from "@/lib/api/dashboard";
import { getTokenCookie } from "@/lib/cookies";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

async function authedRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getTokenCookie();
  if (!token) throw new Error("Please log in again");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || "Reservation request failed");
  return body as T;
}

export async function createPaidReservationAction(payload: Record<string, unknown>) {
  const result = await authedRequest<ReservationCreateResponse>(API.RESERVATIONS.CREATE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/user/reservations");
  return result;
}

export async function getReservationsAction(): Promise<ReservationItem[]> {
  const response = await authedRequest<{ success: boolean; bookings: ReservationItem[]; data: ReservationItem[] }>(API.RESERVATIONS.MY_BOOKINGS);
  return response.bookings || response.data || [];
}

export async function cancelReservationAction(reservationId: string) {
  const result = await authedRequest<ReservationMutationResponse>(API.RESERVATIONS.CANCEL(reservationId), {
    method: "PATCH",
  });
  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/user/reservations");
  return result;
}

"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/config";
import { API } from "@/lib/api/endpoints";
import type { ReviewMutationResponse } from "@/lib/api/dashboard";
import { getTokenCookie } from "@/lib/cookies";

async function reviewRequest(path: string, method: "POST" | "PATCH", payload: Record<string, unknown>) {
  const token = await getTokenCookie();
  if (!token) throw new Error("Please log in again");
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || "Review request failed");
  return body as ReviewMutationResponse;
}

export async function createReviewAction(
  restaurantId: string,
  payload: { reservationId: string; rating: number; comment: string },
) {
  const result = await reviewRequest(API.REVIEWS.BY_RESTAURANT(restaurantId), "POST", payload);
  revalidatePath("/dashboard/user/reservations");
  revalidatePath(`/dashboard/user/restaurants/${restaurantId}`);
  return result;
}

export async function updateReviewAction(
  restaurantId: string,
  reviewId: string,
  payload: { rating: number; comment: string },
) {
  const result = await reviewRequest(API.REVIEWS.BY_ID(restaurantId, reviewId), "PATCH", payload);
  revalidatePath("/dashboard/user/reservations");
  revalidatePath(`/dashboard/user/restaurants/${restaurantId}`);
  return result;
}

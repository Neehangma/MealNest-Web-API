"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, getTokenCookie } from "@/lib/cookies";
import { AdminApiError } from "@/lib/api/admin/user";
import {
  deleteAdminReview,
  getAdminReviewAnalytics,
  getAdminReviews,
  updateAdminReviewStatus,
  type AdminReviewListParams,
  type AdminReviewStatus,
} from "@/lib/api/admin/review";

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

export async function getAdminReviewsAction(params: AdminReviewListParams = {}) {
  return withAdminToken((token) => getAdminReviews(params, token));
}

export async function getAdminReviewAnalyticsAction(range = "7d") {
  return withAdminToken((token) => getAdminReviewAnalytics(range, token));
}

export async function updateAdminReviewStatusAction(reviewId: string, status: AdminReviewStatus) {
  return withAdminToken((token) => updateAdminReviewStatus(reviewId, status, token));
}

export async function deleteAdminReviewAction(reviewId: string) {
  return withAdminToken((token) => deleteAdminReview(reviewId, token));
}

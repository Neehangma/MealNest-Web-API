import { API } from "../endpoints";
import { adminRequest, type PaginationMeta } from "./user";

export type AdminReviewStatus = "published" | "hidden";
export type AdminReview = {
  _id: string;
  id: string;
  userId: string;
  restaurantId: string;
  reservationId: string;
  customer: { name: string; email: string };
  restaurant: { name: string; cuisine: string };
  reservation: { date: string; reservationDate: string; time: string; status: string } | null;
  rating: number;
  comment: string;
  status: AdminReviewStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminReviewListParams = {
  page?: number;
  limit?: number;
  search?: string;
  restaurantId?: string;
  rating?: number;
  status?: "all" | AdminReviewStatus;
  sort?: "newest" | "oldest" | "highest" | "lowest";
};

export type AdminReviewListResponse = {
  success: boolean;
  data: AdminReview[];
  meta: PaginationMeta;
  restaurantOptions: { id: string; name: string }[];
};

export type AdminReviewAnalytics = {
  success: boolean;
  summary: {
    totalReviews: number;
    averageRating: number;
    reviewsThisWeek: number;
    oneStarReviews: number;
  };
  reviewsInRange: number;
  ratingDistribution: { rating: number; count: number }[];
  topReviewedRestaurants: { restaurantId: string; name: string; cuisine: string; reviewCount: number }[];
  recentReviews: {
    _id: string;
    customerName: string;
    restaurantName: string;
    rating: number;
    comment: string;
    status: AdminReviewStatus;
    createdAt: string;
  }[];
};

export function getAdminReviews(params: AdminReviewListParams = {}, token?: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") query.set(key, String(value));
  });
  const suffix = query.size ? `?${query.toString()}` : "";
  return adminRequest<AdminReviewListResponse>(`${API.ADMIN.REVIEWS}${suffix}`, { cache: "no-store" }, token);
}

export function getAdminReviewAnalytics(range = "7d", token?: string) {
  return adminRequest<AdminReviewAnalytics>(
    `${API.ADMIN.REVIEW_ANALYTICS}?${new URLSearchParams({ range })}`,
    { cache: "no-store" },
    token,
  );
}

export function updateAdminReviewStatus(reviewId: string, status: AdminReviewStatus, token?: string) {
  return adminRequest<{ success: boolean; message: string; data: AdminReview }>(
    API.ADMIN.REVIEW_STATUS(reviewId),
    { method: "PATCH", body: JSON.stringify({ status }) },
    token,
  );
}

export function deleteAdminReview(reviewId: string, token?: string) {
  return adminRequest<{ success: boolean; message: string }>(
    API.ADMIN.REVIEW_BY_ID(reviewId),
    { method: "DELETE" },
    token,
  );
}

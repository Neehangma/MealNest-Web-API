import { API } from "../endpoints";
import { adminRequest } from "./user";

export type AdminBooking = {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  cuisine?: string;
  image?: string;
  location?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  reservationDate: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: number | null;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  bookingReference?: string;
  specialRequests?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionId?: string;
  totalPaid?: number;
  createdAt?: string;
  customer: { _id: string; fullName: string; email: string; phoneNumber?: string } | null;
  restaurant?: { _id: string; name: string; cuisine: string; image: string; location: string; address?: string; phone?: string };
};

export type GroupedAdminBooking = {
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  cuisine: string;
  totalBookings: number;
  statusCounts: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  latestBookingDate: string;
};

export type GroupedBookingParams = {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  status?: string;
  sort?: "highest" | "lowest" | "newest" | "oldest";
};

export type GroupedBookingsResponse = {
  success: boolean;
  data: GroupedAdminBooking[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  summary: {
    totalRestaurants: number;
    totalBookings: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    usersBooked: number;
  };
  cuisines: string[];
};

export function getAdminBookings(token?: string) {
  return adminRequest<{ success: boolean; data: AdminBooking[]; total: number }>(API.ADMIN.BOOKINGS, {}, token);
}

export function getGroupedAdminBookings(params: GroupedBookingParams = {}, token?: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") query.set(key, String(value));
  });
  const suffix = query.size ? `?${query.toString()}` : "";
  return adminRequest<GroupedBookingsResponse>(`${API.ADMIN.GROUPED_BOOKINGS}${suffix}`, {}, token);
}

export function getAdminRestaurantBookings(restaurantId: string, token?: string) {
  return adminRequest<{
    success: boolean;
    restaurant: { id: string; name: string; cuisine: string; image: string };
    totalBookings: number;
    bookings: AdminBooking[];
  }>(API.ADMIN.RESTAURANT_BOOKINGS(restaurantId), {}, token);
}

export function completeAdminBooking(reservationId: string, token?: string) {
  return adminRequest<{ success: boolean; message: string; data: AdminBooking }>(
    API.ADMIN.COMPLETE_BOOKING(reservationId),
    { method: "PATCH" },
    token
  );
}

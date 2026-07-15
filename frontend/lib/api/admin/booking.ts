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

export function getAdminBookings(token?: string) {
  return adminRequest<{ success: boolean; data: AdminBooking[]; total: number }>(API.ADMIN.BOOKINGS, {}, token);
}

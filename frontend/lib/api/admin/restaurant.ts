import { adminRequest } from "./user";
import { API } from "../endpoints";

export interface AdminRestaurant {
  _id: string;
  name: string;
  cuisine: string;
  description: string;
  image: string;
  location: string;
  priceRange: string;
  price?: number;
  isActive: boolean;
  isOpen: boolean;
  address: string;
  phone: string;
  hours: string;
  featured: boolean;
  availableTimeSlots: string[];
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export type RestaurantPayload = Omit<AdminRestaurant, "_id" | "createdAt" | "updatedAt" | "image"> & { image?: string };
export type RestaurantListParams = { page?: number; limit?: number; search?: string; cuisine?: string; available?: "true" | "false" };
export type RestaurantsResponse = { success: boolean; data: AdminRestaurant[]; meta: { page: number; limit: number; total: number; totalPages: number; availableTotal: number; cuisineTypes: number } };

export type AdminRestaurantDetails = {
  restaurant: AdminRestaurant & {
    email: string;
    openingTime: string;
    closingTime: string;
    totalTables: number;
    capacity: number;
    tables: Array<{ _id?: string; tableNumber: number; capacity: number; isAvailable: boolean }>;
    menu: Array<{
      category: string;
      name: string;
      description?: string;
      price?: number | null;
      isAvailable?: boolean;
      type?: string;
    }>;
  };
  activity: {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalReviews: number;
    averageRating: number;
    totalFavorites: number;
  };
  bookings: Array<{
    _id: string;
    customer: { id: string; name: string; email: string } | null;
    reservationDate: string;
    date: string;
    time: string;
    guests: number;
    paymentMethod?: string;
    status: string;
  }>;
  reviews: Array<{
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    status: "published" | "hidden";
    createdAt: string;
  }>;
};

export function getAdminRestaurants(params: RestaurantListParams = {}, token?: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  return adminRequest<RestaurantsResponse>(`${API.RESTAURANTS.LIST}?${query}`, {}, token);
}

export function getAdminRestaurantDetails(id: string, token?: string) {
  return adminRequest<{ success: boolean; data: AdminRestaurantDetails }>(API.ADMIN.RESTAURANT_DETAILS(id), {}, token);
}

export function createRestaurant(data: FormData, token?: string) {
  return adminRequest<{ success: boolean; data: AdminRestaurant; message: string }>(API.RESTAURANTS.LIST, { method: "POST", body: data }, token);
}

export function updateRestaurant(id: string, data: FormData, token?: string) {
  return adminRequest<{ success: boolean; data: AdminRestaurant; message: string }>(API.RESTAURANTS.BY_ID(id), { method: "PUT", body: data }, token);
}

export function deleteRestaurant(id: string, token?: string) {
  return adminRequest<{ success: boolean; message: string }>(API.RESTAURANTS.BY_ID(id), { method: "DELETE" }, token);
}

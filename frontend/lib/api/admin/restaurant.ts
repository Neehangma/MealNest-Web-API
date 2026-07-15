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

export function getAdminRestaurants(params: RestaurantListParams = {}, token?: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "") query.set(key, String(value)); });
  return adminRequest<RestaurantsResponse>(`${API.RESTAURANTS.LIST}?${query}`, {}, token);
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

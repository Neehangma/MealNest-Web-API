import { API } from "./endpoints";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

export type DashboardStats = {
  bookings: number;
  favorites: number;
  averageRating: number;
};

export type FavoriteRestaurant = {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  image: string;
  isOpen: boolean;
  status: string;
  location?: string;
  priceRange?: string;
  price?: number;
};

export type ReservationItem = {
  _id: string;
  restaurantId: string;
  restaurantName: string;
  cuisine: string;
  image: string;
  reservationDate: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  specialRequests?: string;
  bookingReference?: string;
  location?: string;
  restaurantLocation?: string;
  restaurantAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: "esewa" | "mobile_banking";
  paymentStatus?: "simulated_success";
  totalPaid?: number;
  totalAmount?: number;
  partySize?: number;
  transactionId?: string;
  createdAt?: string;
  restaurantPhone?: string;
  restaurant?: {
    _id: string; name: string; cuisine: string; image: string; location: string;
    address?: string; phone?: string; description?: string; priceRange?: string; hours?: string;
  };
};

export type ConfirmedBooking = ReservationItem & {
  bookingReference: string;
  restaurantLocation: string;
  restaurantAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: "esewa" | "mobile_banking";
  paymentStatus: "simulated_success";
  totalPaid: number;
  totalAmount: number;
  partySize: number;
};

export type DashboardData = {
  stats: DashboardStats;
  favorites: FavoriteRestaurant[];
  upcomingReservations: ReservationItem[];
  recentHistory: ReservationItem[];
  cancelledReservations: ReservationItem[];
};

export type DashboardResponse = {
  success: boolean;
  data: DashboardData;
};

export type RestaurantItem = {
  _id: string;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  price?: number;
  image: string;
  isOpen: boolean;
  description: string;
  address: string;
  phone: string;
  hours: string;
  featured: boolean;
  availableTimeSlots: string[];
  features: string[];
};

export type RestaurantResponse = {
  success: boolean;
  data: RestaurantItem;
};

export type RestaurantsListResponse = {
  success: boolean;
  data: RestaurantItem[];
};

export type FavoriteToggleResponse = {
  success: boolean;
  message: string;
  data: {
    action: string;
    favorites: FavoriteRestaurant[];
  };
};

export type ReservationCreateResponse = {
  success: boolean;
  message: string;
  booking?: ConfirmedBooking;
  data?: ConfirmedBooking;
  emailSent?: boolean;
};

export type ReservationMutationResponse = {
  success: boolean;
  message: string;
  data: ReservationItem;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined"
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1]
    : undefined;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body as T;
}

export async function getDashboardData() {
  return request<DashboardResponse>(API.DASHBOARD.GET);
}

export async function getRestaurants() {
  const response = await request<unknown>(`${API.RESTAURANTS.LIST}?limit=100`);
  const body = response as {
    success?: boolean;
    restaurants?: unknown;
    data?: unknown | { restaurants?: unknown; data?: unknown };
  };
  const nestedData = body.data as { restaurants?: unknown; data?: unknown } | undefined;
  const restaurants = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body.restaurants)
      ? body.restaurants
      : Array.isArray(nestedData?.restaurants)
        ? nestedData.restaurants
        : Array.isArray(nestedData?.data)
          ? nestedData.data
          : [];

  return {
    success: body.success !== false,
    data: restaurants as RestaurantItem[],
  } satisfies RestaurantsListResponse;
}

export async function getRestaurantById(id: string) {
  return request<RestaurantResponse>(API.RESTAURANTS.BY_ID(id));
}

export async function toggleFavorite(restaurantId: string) {
  return request<FavoriteToggleResponse>(API.FAVORITES.TOGGLE(restaurantId), {
    method: "POST",
  });
}

export async function removeFavorite(restaurantId: string) {
  return request<FavoriteToggleResponse>(API.FAVORITES.TOGGLE(restaurantId), {
    method: "DELETE",
  });
}

export async function createReservation(payload: Record<string, unknown>) {
  return request<ReservationCreateResponse>(API.RESERVATIONS.CREATE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateReservation(reservationId: string, payload: Record<string, unknown>) {
  return request<ReservationMutationResponse>(API.RESERVATIONS.BY_ID(reservationId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function cancelReservation(reservationId: string) {
  return request<ReservationMutationResponse>(API.RESERVATIONS.BY_ID(reservationId), {
    method: "DELETE",
  });
}

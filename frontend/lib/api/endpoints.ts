// centralized path definitions for API endpoints
export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
        CURRENT: "/api/v1/auth/current",
    },
    PROFILE: {
        UPDATE: "/api/v1/profile",
        PASSWORD: "/api/v1/profile/password",
    },
    DASHBOARD: {
        GET: "/api/v1/dashboard",
    },
    RESTAURANTS: {
        LIST: "/api/v1/restaurants",
        BY_ID: (id: string) => `/api/v1/restaurants/${id}`,
    },
    FAVORITES: {
        TOGGLE: (restaurantId: string) => `/api/v1/favorites/${restaurantId}`,
    },
    RESERVATIONS: {
        CREATE: "/api/v1/reservations",
        MY_BOOKINGS: "/api/v1/bookings/my-bookings",
        CANCEL: (reservationId: string) => `/api/v1/bookings/${reservationId}/cancel`,
        BY_ID: (reservationId: string) => `/api/v1/reservations/${reservationId}`,
    },
    ADMIN: {
        USERS: "/api/v1/admin/users",
        BOOKINGS: "/api/v1/admin/bookings",
        PROFILE: "/api/v1/admin/profile",
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    }
}

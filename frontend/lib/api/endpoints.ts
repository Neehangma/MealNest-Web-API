// centralized path definitions for API endpoints
export const API = {
    AUTH: {
        REGISTER: "/api/v1/auth/register",
        LOGIN: "/api/v1/auth/login",
        CURRENT: "/api/v1/auth/current",
        FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
        RESET_PASSWORD: (token: string) => `/api/v1/auth/reset-password/${encodeURIComponent(token)}`,
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
    REVIEWS: {
        BY_RESTAURANT: (restaurantId: string) => `/api/v1/restaurants/${restaurantId}/reviews`,
        BY_ID: (restaurantId: string, reviewId: string) => `/api/v1/restaurants/${restaurantId}/reviews/${reviewId}`,
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
        GROUPED_BOOKINGS: "/api/v1/admin/bookings/grouped-by-restaurant",
        RESTAURANT_BOOKINGS: (restaurantId: string) => `/api/v1/admin/restaurants/${restaurantId}/bookings`,
        PROFILE: "/api/v1/admin/profile",
        DASHBOARD_STATS: "/api/v1/admin/dashboard/stats",
        ANALYTICS: "/api/v1/admin/analytics",
        REVIEWS: "/api/v1/admin/reviews",
        REVIEW_ANALYTICS: "/api/v1/admin/reviews/analytics",
        REVIEW_STATUS: (reviewId: string) => `/api/v1/admin/reviews/${reviewId}/status`,
        REVIEW_BY_ID: (reviewId: string) => `/api/v1/admin/reviews/${reviewId}`,
        COMPLETE_BOOKING: (reservationId: string) => `/api/v1/admin/bookings/${reservationId}/complete`,
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    }
}

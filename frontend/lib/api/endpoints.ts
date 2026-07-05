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
    ADMIN: {
        USERS: "/api/v1/admin/users",
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    }
}

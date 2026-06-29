// centralized path definitions for API endpoints
export const API = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        CURRENT: "/api/auth/current",
    },
    ADMIN: {
        USERS: "/api/v1/admin/users",
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    }
}
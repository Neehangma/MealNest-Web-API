import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
    || "http://localhost:8088";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1];
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default axiosInstance;
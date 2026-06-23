import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import type { LoginFormData, RegisterFormData } from "@/app/(auth)/components/schema";
import type { AuthUser } from "@/lib/contexts/AuthContext";

type ApiResponse<T = unknown> = {
    success: boolean;
    message: string;
    data: T;
};

type AuthPayload = {
    user: AuthUser;
    token: string;
};

type UserPayload = {
    user: AuthUser;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    const responseMessage = (
        error as { response?: { data?: { message?: string } } }
    ).response?.data?.message;

    return responseMessage || fallback;
};

export const register = async (data: RegisterFormData): Promise<ApiResponse<AuthPayload>> => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.REGISTER, data); // path, data
        return response.data; // reponse ko body
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Registration failed"));
        // error?.response?.data -> response ko body
    }
}

export const login = async (data: LoginFormData): Promise<ApiResponse<AuthPayload>> => {
    try {
        const response =
            await axiosInstance.post(API.AUTH.LOGIN, data); // path, data
        return response.data; // reponse ko body
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Login failed"));
    }
}

export const whoami = async (token: string): Promise<ApiResponse<UserPayload>> => {
    try {
        const response = await axiosInstance.get(API.AUTH.WHOAMI, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Failed to load user profile"));
    }
}

export const updateUser = async (data: FormData, token: string): Promise<ApiResponse<UserPayload>> => {
    try {
        const response = await axiosInstance.patch(API.AUTH.UPDATE, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Profile update failed"));
    }
}

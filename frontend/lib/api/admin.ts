import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}): Promise<PaginatedUsersResponse> => {
  try {
    const response = await axiosInstance.get(API.ADMIN.USERS, { params });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};

export const getUserById = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.get(API.ADMIN.USER_BY_ID(id));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};

export const createUser = async (data: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role?: "user" | "admin";
}): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.post(API.ADMIN.USERS, data);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "Failed to create user");
  }
};

export const updateUser = async (
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    role?: "user" | "admin";
  }
): Promise<UserResponse> => {
  try {
    const response = await axiosInstance.put(API.ADMIN.USER_BY_ID(id), data);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "Failed to update user");
  }
};

export const deleteUser = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axiosInstance.delete(API.ADMIN.USER_BY_ID(id));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(error?.response?.data?.message || "Failed to delete user");
  }
};

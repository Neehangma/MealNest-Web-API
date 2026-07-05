import { API } from "./endpoints";

export type AuthUser = {
  id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  location?: string;
  bio?: string;
  role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
};

export type AuthRequest = {
  fullName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
};

export type CurrentUserResponse = {
  success: boolean;
  user: AuthUser;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

async function authRequest(path: string, data: AuthRequest) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Authentication failed");
  }

  return body as AuthResponse;
}

export const register = async (data: AuthRequest) => {
  return authRequest(API.AUTH.REGISTER, data);
};

export const login = async (data: AuthRequest) => {
  return authRequest(API.AUTH.LOGIN, data);
};

export const getCurrentUser = async (token: string) => {
  const response = await fetch(`${BASE_URL}${API.AUTH.CURRENT}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Unable to fetch current user");
  }

  return body as CurrentUserResponse;
};

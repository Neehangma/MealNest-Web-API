import { API } from "./endpoints";

export type AuthUser = {
  id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
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

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

export type RegistrationResponse = {
  success: boolean;
  message: string;
  user: AuthUser;
};

export type CurrentUserResponse = {
  success: boolean;
  user: AuthUser;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

async function authRequest<T>(path: string, data: AuthRequest) {
  const endpoint = `${BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Authentication API connection failed", {
        endpoint,
        error: error instanceof Error ? error.message : "Unknown network error",
      });
    }
    throw new Error("Unable to connect to the server. Please make sure the backend is running and try again.");
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || "Authentication failed");
  }

  if (!body) {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  return body as T;
}

export const register = async (data: AuthRequest) => {
  return authRequest<RegistrationResponse>(API.AUTH.REGISTER, data);
};

export const login = async (data: AuthRequest) => {
  return authRequest<AuthResponse>(API.AUTH.LOGIN, data);
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

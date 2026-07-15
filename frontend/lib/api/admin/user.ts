import { API } from "../endpoints";

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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  success: boolean;
  data: User[];
  meta: PaginationMeta;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface UserPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  role: "user" | "admin";
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8088";

export class AdminApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "AdminApiError";
  }
}

function getBrowserAuthToken() {
  if (typeof document === "undefined") return "";

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1] || ""
  );
}

export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
  token = getBrowserAuthToken()
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AdminApiError(body?.message || "Admin request failed", response.status);
  }

  return body as T;
}

export async function getUsers(
  params: UserListParams = {},
  token?: string
): Promise<PaginatedUsersResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return adminRequest<PaginatedUsersResponse>(`${API.ADMIN.USERS}${suffix}`, {}, token);
}

export async function getUserById(id: string, token?: string): Promise<UserResponse> {
  return adminRequest<UserResponse>(API.ADMIN.USER_BY_ID(id), {}, token);
}

export async function createUser(
  data: UserPayload & { password: string },
  token?: string
): Promise<UserResponse> {
  return adminRequest<UserResponse>(
    API.ADMIN.USERS,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function updateUser(
  id: string,
  data: Partial<UserPayload>,
  token?: string
): Promise<UserResponse> {
  return adminRequest<UserResponse>(
    API.ADMIN.USER_BY_ID(id),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function deleteUser(
  id: string,
  token?: string
): Promise<{ success: boolean; message: string }> {
  return adminRequest<{ success: boolean; message: string }>(
    API.ADMIN.USER_BY_ID(id),
    {
      method: "DELETE",
    },
    token
  );
}

import { expect, type APIRequestContext } from "@playwright/test";

export const API_URL = "http://127.0.0.1:18088";
export const PASSWORD = "TestPassword123!";

export async function login(request: APIRequestContext, email: string, password = PASSWORD) {
  const response = await request.post(`${API_URL}/api/auth/login`, { data: { email, password } });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()).token as string;
}

export async function register(request: APIRequestContext, prefix: string) {
  const email = `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const response = await request.post(`${API_URL}/api/auth/register`, {
    data: { fullName: `E2E ${prefix}`, email, phoneNumber: "9800000000", password: PASSWORD },
  });
  expect(response.status(), await response.text()).toBe(201);
  const body = await response.json();
  return { email, token: body.token as string, user: body.user };
}

export async function restaurant(request: APIRequestContext) {
  const response = await request.get(`${API_URL}/api/restaurants/cuisine/Italian`);
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()).restaurants[0];
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function bookingData(item: { _id: string; name: string }) {
  const reference = `E2E-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    restaurantId: item._id,
    restaurantName: item.name,
    customerName: "E2E Customer",
    customerPhone: "9800000000",
    date: "2030-07-26",
    reservationDate: "2030-07-26T13:15:00.000Z",
    time: "7:00 PM",
    guests: 2,
    paymentMethod: "esewa",
    paymentStatus: "simulated_success",
    totalPaid: 500,
    transactionId: reference,
  };
}

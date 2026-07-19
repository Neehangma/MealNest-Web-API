import { expect, test } from "@playwright/test";
import { API_URL, PASSWORD, auth, login } from "./helpers";

test("admin users, bookings and temporary restaurant CRUD", async ({ request }) => {
  const token = await login(request, "e2e-admin@example.com", PASSWORD);
  expect((await request.get(`${API_URL}/api/admin/users`, { headers: auth(token) })).ok()).toBeTruthy();
  expect((await request.get(`${API_URL}/api/admin/bookings`, { headers: auth(token) })).ok()).toBeTruthy();
  const name = `E2E Temporary ${Date.now()}`;
  const created = await request.post(`${API_URL}/api/restaurants`, { headers: auth(token), multipart: { name, cuisine: "Italian", location: "Kathmandu", address: "E2E Street", phone: "9800000000", description: "Temporary", price: "450" } });
  expect(created.status(), await created.text()).toBe(201);
  const item = (await created.json()).restaurant;
  const updated = await request.put(`${API_URL}/api/restaurants/${item._id}`, { headers: auth(token), multipart: { name: `${name} Updated`, cuisine: "Italian", location: "Kathmandu", address: "E2E Street", phone: "9800000000", description: "Temporary", price: "450" } });
  expect(updated.ok(), await updated.text()).toBeTruthy();
  expect((await request.delete(`${API_URL}/api/restaurants/${item._id}`, { headers: auth(token) })).ok()).toBeTruthy();
});

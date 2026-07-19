import { expect, test } from "@playwright/test";
import { API_URL, auth, register, restaurant } from "./helpers";
test("adds and removes a favourite", async ({ request }) => {
  const user = await register(request, "favorite"); const item = await restaurant(request);
  expect((await request.post(`${API_URL}/api/favorites/${item._id}`, { headers: auth(user.token) })).ok()).toBeTruthy();
  const list = await request.get(`${API_URL}/api/dashboard`, { headers: auth(user.token) });
  expect((await list.json()).favorites.some((value: { _id: string }) => value._id === item._id)).toBeTruthy();
  expect((await request.delete(`${API_URL}/api/favorites/${item._id}`, { headers: auth(user.token) })).ok()).toBeTruthy();
});

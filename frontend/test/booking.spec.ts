import { expect, test } from "@playwright/test";
import { API_URL, auth, bookingData, register, restaurant } from "./helpers";
test("creates a booking", async ({ request }) => {
  const user = await register(request, "booking"); const item = await restaurant(request);
  const response = await request.post(`${API_URL}/api/bookings`, { headers: auth(user.token), data: bookingData(item) });
  expect(response.status(), await response.text()).toBe(201);
  expect((await response.json()).booking._id).toBeTruthy();
});

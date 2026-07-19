import { expect, test } from "@playwright/test";
import { API_URL, auth, bookingData, register, restaurant } from "./helpers";
test("lists and cancels the E2E reservation", async ({ request }) => {
  const user = await register(request, "reservation"); const item = await restaurant(request);
  const created = await request.post(`${API_URL}/api/bookings`, { headers: auth(user.token), data: bookingData(item) });
  const id = (await created.json()).booking._id;
  const list = await request.get(`${API_URL}/api/bookings/my-bookings`, { headers: auth(user.token) });
  expect((await list.json()).bookings.some((value: { _id: string }) => value._id === id)).toBeTruthy();
  const cancelled = await request.patch(`${API_URL}/api/bookings/${id}/cancel`, { headers: auth(user.token) });
  expect((await cancelled.json()).data.status).toBe("cancelled");
});

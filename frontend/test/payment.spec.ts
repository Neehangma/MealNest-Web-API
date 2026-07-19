import { expect, test } from "@playwright/test";
import { API_URL, auth, bookingData, register, restaurant } from "./helpers";
test("completes simulated payment", async ({ request }) => {
  const user = await register(request, "payment"); const item = await restaurant(request);
  const response = await request.post(`${API_URL}/api/bookings`, { headers: auth(user.token), data: bookingData(item) });
  expect(response.status(), await response.text()).toBe(201);
  expect((await response.json()).booking).toMatchObject({ paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 500 });
});

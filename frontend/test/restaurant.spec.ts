import { expect, test } from "@playwright/test";
import { API_URL, auth, register } from "./helpers";

test("landing page preserves restaurant navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /restaurant/i }).first()).toBeVisible();
});

test("filters and opens live restaurant details", async ({ request }) => {
  const user = await register(request, "restaurant");
  const filtered = await request.get(`${API_URL}/api/restaurants/cuisine/Italian`);
  expect(filtered.ok(), await filtered.text()).toBeTruthy();
  const item = (await filtered.json()).restaurants.find((value: { name: string }) => value.name === "E2E Trattoria");
  expect(item).toBeTruthy();
  const details = await request.get(`${API_URL}/api/restaurants/${item._id}`, { headers: auth(user.token) });
  expect(details.ok(), await details.text()).toBeTruthy();
  expect((await details.json()).data).toMatchObject({ name: "E2E Trattoria", cuisine: "Italian" });
});

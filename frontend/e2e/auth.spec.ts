import { expect, test } from "@playwright/test";

test("public authentication routes remain available", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
});

test("registration, login and logout", async () => { test.skip(true, "Requires a dedicated disposable E2E database and credentials; the configured backend may contain production data."); });

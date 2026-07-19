import { expect, test } from "@playwright/test";

test("public authentication routes remain available", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
});

test("registration, login and logout", async ({ page }) => {
  const email = `auth-${Date.now()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel(/full name/i).fill("E2E Auth User");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/phone/i).fill("9800000000");
  await page.getByLabel(/^password/i).fill("TestPassword123");
  const confirm = page.getByLabel(/confirm password/i);
  if (await confirm.count()) await confirm.fill("TestPassword123");
  await page.getByRole("checkbox", { name: /terms and privacy/i }).check();
  await page.getByRole("button", { name: /create account|sign up|register/i }).click();
  await expect(page).toHaveURL(/dashboard\/user/);
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("TestPassword123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/dashboard\/user/);
  await page.context().clearCookies();
  await page.goto("/login");
});

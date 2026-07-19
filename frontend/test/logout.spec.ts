import { expect, test } from "@playwright/test";

test("cancel and confirm authenticated logout", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("e2e-admin@example.com");
  await page.getByLabel("Password").fill("TestPassword123");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/admin/);
  await page.getByRole("button", { name: "Logout" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm Logout" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Logout" }).click();
  await dialog.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/login/);
});

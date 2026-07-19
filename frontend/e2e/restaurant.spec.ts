import { expect, test } from "@playwright/test";

test("landing page preserves restaurant navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /restaurant/i }).first()).toBeVisible();
});

test("filters and opens live restaurant details", async () => { test.skip(true, "Depends on mutable live restaurant seed data; isolated component and API tests cover this behavior."); });

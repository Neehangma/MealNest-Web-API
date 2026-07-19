import { test } from "@playwright/test";
test("admin users, bookings and temporary restaurant CRUD", async () => { test.skip(true, "No isolated E2E admin/database is configured; running this would alter real data."); });

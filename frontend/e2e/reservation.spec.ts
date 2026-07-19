import { test } from "@playwright/test";
test("lists and cancels the E2E reservation", async () => { test.skip(true, "Cancellation would mutate the configured database; no disposable E2E database is configured."); });

import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  env: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8088",
    userEmail: process.env.CYPRESS_TEST_USER_EMAIL || "",
    userPassword: process.env.CYPRESS_TEST_USER_PASSWORD || "",
    adminEmail: process.env.CYPRESS_TEST_ADMIN_EMAIL || "",
    adminPassword: process.env.CYPRESS_TEST_ADMIN_PASSWORD || "",
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
});

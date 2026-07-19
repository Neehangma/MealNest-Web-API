import { defineConfig, devices } from "@playwright/test";

const e2eApiUrl = "http://127.0.0.1:18088";

export default defineConfig({
  testDir: "./test",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3000", extraHTTPHeaders: { "x-e2e-api-url": e2eApiUrl }, screenshot: "only-on-failure", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    { command: "node ../backend/scr/__tests__/e2e-server.js", url: `${e2eApiUrl}/api/health`, reuseExistingServer: false, timeout: 120_000 },
    { command: "npm run dev -- --hostname 127.0.0.1 --port 3000", url: "http://127.0.0.1:3000", reuseExistingServer: false, timeout: 120_000, env: { NEXT_PUBLIC_API_BASE_URL: e2eApiUrl } },
  ],
});

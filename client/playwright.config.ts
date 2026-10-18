import { defineConfig, devices } from "@playwright/test";

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: externalBaseURL ?? "http://127.0.0.1:3010",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : [
    {
      command: "node e2e/mock-api.mjs",
      url: "http://127.0.0.1:8011/api/v1/genres",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        MOCK_API_PORT: "8011",
      },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 3010",
      url: "http://127.0.0.1:3010",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NUXT_GAME_API_URL: "http://127.0.0.1:8011/api/v1",
        NUXT_IGNORE_LOCK: "1",
      },
    },
      ],
});

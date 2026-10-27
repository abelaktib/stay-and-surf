import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT || 3200;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: {
    // Le build doit être fait avant (npm run build) ; sans clé Stripe, le paiement est désactivé
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/fr`,
    reuseExistingServer: !process.env.CI,
    env: { STRIPE_SECRET_KEY: "", AIRBNB_ICAL_URL: "", BOOKING_ICAL_URL: "" },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});

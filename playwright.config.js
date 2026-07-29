import { defineConfig, devices } from '@playwright/test';

/**
 * Runs against the built output, not the dev server: the bugs these tests exist
 * to catch — a control covered by an overlay, a label frozen at build time —
 * only show up in what is actually shipped.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Pixel 5 rather than an iPhone: it emulates a touch phone on Chromium.
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
    // Safari is the whole of iOS, and the terminal's on-screen-keyboard
    // handling was written for it — until now it had only ever been checked
    // against a simulation of that keyboard, never the real engine.
    { name: 'safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

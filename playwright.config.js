import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5175',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 390, height: 844 }, // iPhone 14 size
  },
  webServer: {
    command: 'npm run dev',
    port: 5175,
    timeout: 15000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'mobile-chrome', use: { browserName: 'chromium' } },
  ],
})

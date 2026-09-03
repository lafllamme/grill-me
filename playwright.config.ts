import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

// Playwright enables colors for its workers and web server. Remove an
// inherited NO_COLOR flag before those child processes are created so Node
// does not report the conflicting NO_COLOR/FORCE_COLOR pair.
delete process.env.NO_COLOR

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4173'
const shouldUseExternalServer = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL)

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: shouldUseExternalServer
    ? undefined
    : {
        command: 'pnpm exec nuxt dev --host 127.0.0.1 --port 4173',
        port: 4173,
        timeout: 180_000,
        reuseExistingServer: true,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

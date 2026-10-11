import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

import { DEFAULT_LOCALE, LOCALE_CONFIG } from './src/lib/sites'

/**
 * E2E against the local dev server (or BASE_URL, e.g. a Hosait preview).
 * Three devices: Pixel 7 (mobile first), iPad and desktop.
 */
// E2E_PORT: another local app may already use 3100.
const port = process.env.E2E_PORT || '3100'
const baseURL = process.env.BASE_URL || `http://localhost:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'on-first-retry', locale: LOCALE_CONFIG[DEFAULT_LOCALE].intl },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `pnpm exec cross-env NODE_OPTIONS=--no-deprecation next dev -p ${port}`, reuseExistingServer: true, url: `${baseURL}/api/health`, timeout: 180_000 },
})

import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

/**
 * E2E mot lokal dev-server (eller BASE_URL, f.eks. staging på Hosait).
 * Tre enheter: Pixel 7 (mobil først), iPad (nettbrett) og desktop.
 */
const baseURL = process.env.BASE_URL || 'http://localhost:3100'

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'on-first-retry', locale: 'nb-NO' },
  projects: [
    { name: 'mobil', use: { ...devices['Pixel 7'] } },
    { name: 'nettbrett', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'pnpm dev', reuseExistingServer: true, url: 'http://localhost:3100/api/health', timeout: 180_000 },
})

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    // Grant clipboard access so copy-button tests assert real writes.
    permissions: ['clipboard-read', 'clipboard-write'],
  },
  webServer: {
    command: 'node e2e/server.mjs',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});

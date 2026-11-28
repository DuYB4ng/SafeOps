import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  timeout: 30000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
    browserName: 'chromium',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start -p 3100',
    url: 'http://127.0.0.1:3100/components',
    reuseExistingServer: false,
    timeout: 120000,
  },
});

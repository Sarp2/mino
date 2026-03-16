import { defineConfig, devices } from '@playwright/test';

import { AUTH_STATE_PATH, BASE_URL } from './tests/e2e/helpers/env';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    workers: 1,
    // eslint-disable-next-line no-restricted-properties
    forbidOnly: !!process.env.CI,
    // eslint-disable-next-line no-restricted-properties
    retries: process.env.CI ? 1 : 0,
    timeout: 120_000,
    expect: {
        timeout: 20_000,
    },
    // eslint-disable-next-line no-restricted-properties
    reporter: process.env.CI
        ? [['github'], ['html', { open: 'never' }]]
        : 'list',
    use: {
        ...devices['Desktop Chrome'],
        baseURL: BASE_URL,
        storageState: AUTH_STATE_PATH,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    globalSetup: './tests/e2e/global-setup.ts',
    globalTeardown: './tests/e2e/global-teardown.ts',
    webServer: {
        command: 'NODE_ENV=test bun run --env-file=.env.e2e dev',
        url: BASE_URL,
        // eslint-disable-next-line no-restricted-properties
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
    ],
});

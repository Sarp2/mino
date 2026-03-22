import { expect, test } from '@playwright/test';

test('authenticated user can access projects page', async ({ page }) => {
    await page.goto('/projects');
    await expect(page).toHaveURL(/\/projects/);
    await expect(
        page
            .context()
            .cookies()
            .then((cookies) =>
                cookies.some(({ name }) => name.startsWith('sb-')),
            ),
    ).resolves.toBe(true);
    await expect(page.locator('body')).toBeVisible();
});

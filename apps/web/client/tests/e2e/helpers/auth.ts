import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

import type { User as AuthUser } from '@supabase/supabase-js';

import { SEED_USER } from '@mino/db';

import { AUTH_STATE_PATH, BASE_URL } from './env';
import { supabaseAdmin } from './supabase';

export const createSupabaseAuthUser = async (): Promise<AuthUser> => {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: SEED_USER.EMAIL,
        password: SEED_USER.PASSWORD,
        email_confirm: true,
        user_metadata: {
            first_name: SEED_USER.FIRST_NAME,
            last_name: SEED_USER.LAST_NAME,
            display_name: SEED_USER.DISPLAY_NAME,
            avatar_url: SEED_USER.AVATAR_URL,
        },
    });

    if (error || !data.user) {
        throw new Error(`Failed to create demo auth user: ${error?.message}`);
    }

    return data.user;
};

export const removeSupabaseAuthUser = async (): Promise<void> => {
    const { data: listData, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        throw new Error(`Failed to list auth users: ${listError.message}`);
    }

    const existingUser = listData.users.find(
        (u) => u.email === SEED_USER.EMAIL,
    );

    if (!existingUser) {
        return;
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(
        existingUser.id,
    );

    if (error) {
        throw new Error(`Failed to delete demo auth user: ${error.message}`);
    }
};

/**
 * Signs in the seeded E2E user through the real login page and persists the
 * browser's authenticated storage state for Playwright.
 */
export const saveAuthStateToDisk = async (): Promise<void> => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
        await expect(page).toHaveURL(/\/login$/);

        await page
            .getByRole('button', { name: 'Continue with Demo User' })
            .click();

        await page.waitForURL('**/projects**', { timeout: 20_000 });

        await expect
            .poll(
                async () =>
                    (await context.cookies()).some(({ name }) =>
                        name.startsWith('sb-'),
                    ),
                {
                    message:
                        'Supabase auth cookies were not set after demo login',
                    timeout: 10_000,
                },
            )
            .toBe(true);

        await mkdir(path.dirname(AUTH_STATE_PATH), { recursive: true });
        await context.storageState({ path: AUTH_STATE_PATH });
    } finally {
        await page.close().catch(() => undefined);
        await context.close().catch(() => undefined);
        await browser.close().catch(() => undefined);
    }
};

export const removeAuthStateFile = async (): Promise<void> => {
    await mkdir(path.dirname(AUTH_STATE_PATH), { recursive: true });
    await rm(AUTH_STATE_PATH, { force: true });
};

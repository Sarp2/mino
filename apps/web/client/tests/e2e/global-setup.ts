import type { FullConfig } from '@playwright/test';

import {
    createSupabaseAuthUser,
    removeSupabaseAuthUser,
    saveAuthStateToDisk,
} from './helpers/auth';
import { createDatabaseUser } from './helpers/db';

async function globalSetup(_config: FullConfig) {
    // Clean the supabase auth user if any
    await removeSupabaseAuthUser();

    // Create a supabase auth user
    const user = await createSupabaseAuthUser();

    // Create the database user
    await createDatabaseUser(user);

    // Save auth token to disk
    await saveAuthStateToDisk();
}

export default globalSetup;

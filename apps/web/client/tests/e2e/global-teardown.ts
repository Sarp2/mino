import { removeAuthStateFile, removeSupabaseAuthUser } from './helpers/auth';
import { cleanupAllProjectTables } from './helpers/db';

async function globalTeardown() {
    // Clean all the database tables
    await cleanupAllProjectTables();

    // Clean the supabase auth user
    await removeSupabaseAuthUser();

    // Remove the auth token
    await removeAuthStateFile();
}

export default globalTeardown;

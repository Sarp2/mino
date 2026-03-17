import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index';

const databaseUrl =
    process.env.MINO_ENV && process.env.MINO_ENV === 'test'
        ? process.env.TEST_SUPABASE_DATABASE_URL
        : process.env.SUPABASE_DATABASE_URL;

if (databaseUrl === undefined) {
    throw new Error(
        `Database URL is not configured. Expected ${
            process.env.MINO_ENV === 'test'
                ? 'TEST_SUPABASE_DATABASE_URL'
                : 'SUPABASE_DATABASE_URL'
        } to be set.`,
    );
}

/*
 * Cache the database connection in development. This avoids creating a new connection on every HMR update
 */
const globalFordb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

let conn: postgres.Sql | undefined;

try {
    conn = globalFordb.conn ?? postgres(databaseUrl, { prepare: false });
} catch (error) {
    throw new Error(
        `Failed to establish database connection: ${error instanceof Error ? error.message : String(error)}`,
    );
}

if (process.env.NODE_ENV !== 'production') {
    globalFordb.conn = conn;
}

export const db = drizzle(conn, { schema });
export type DrizzleDb = typeof db;

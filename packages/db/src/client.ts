import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@mino/db/src/schema';

/*
 * Cache the database connection in development. This avoids creating a new connection on every HMR update
 */

if (process.env.SUPABASE_DATABASE_URL === undefined) {
    throw new Error(
        'SUPABASE_DATABASE_URL environment variable is not configured',
    );
}

const globalFordb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

const conn =
    globalFordb.conn ??
    postgres(process.env.SUPABASE_DATABASE_URL, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
    globalFordb.conn = conn;
}

export const db = drizzle(conn, { schema });
export type DrizzleDb = typeof db;

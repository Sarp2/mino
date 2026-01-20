import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@mino/db/src/schema';

const globalFordb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

const conn =
    globalFordb.conn ??
    postgres(process.env.SUPABASE_DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
    globalFordb.conn = conn;
}

export const db = drizzle(conn, { schema });
export type DrizzleDb = typeof db;

import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';

import * as schema from '@mino/db/src/schema';

const globalFordb = globalThis as unknown as {
    conn: SQL | undefined;
};

const conn =
    globalFordb.conn ??
    new SQL(process.env.SUPABASE_DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
    globalFordb.conn = conn;
}

export const db = drizzle(conn, { schema });
export type DrizzleDb = typeof db;

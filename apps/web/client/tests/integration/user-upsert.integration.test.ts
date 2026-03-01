/* eslint-disable no-restricted-properties */
import { randomUUID } from 'node:crypto';
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from 'bun:test';
import { and, eq, sql } from 'drizzle-orm';

import type { User as SupabaseUser } from '@supabase/supabase-js';

process.env.SKIP_ENV_VALIDATION ??= 'true';
process.env.SUPABASE_DATABASE_URL ??=
    'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://127.0.0.1:54321';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??= 'test-publishable-key';
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';

const [{ createCaller }, { db }, { users }] = await Promise.all([
    import('@/server/api/root'),
    import('@mino/db/src/client'),
    import('@mino/db/src/schema'),
]);

const createdIds = new Set<string>();
const headers = new Headers();
let hasDatabaseConnection = false;

const buildAuthUser = (id: string): SupabaseUser =>
    ({
        id,
        email: `${id}@mino.test`,
        app_metadata: {},
        user_metadata: {
            name: 'Edge Case Tester',
            avatar_url: 'https://images.example/avatar.png',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
    }) as SupabaseUser;

const cleanUsers = async () => {
    if (!hasDatabaseConnection || createdIds.size === 0) return;

    const clauses = [...createdIds].map((id) => eq(users.id, id));
    await db
        .delete(users)
        .where(clauses.length === 1 ? clauses[0]! : and(...clauses));

    createdIds.clear();
};

beforeAll(async () => {
    try {
        await db.execute(sql`select 1`);
        hasDatabaseConnection = true;
    } catch (error) {
        console.warn(
            'Supabase local database is unavailable for integration test:',
            error,
        );
    }
});

afterAll(async () => {
    await cleanUsers();
});

beforeEach(async () => {
    await cleanUsers();
});

describe('userRouter.upsert integration', () => {
    test('rejects unauthenticated caller', async () => {
        const caller = createCaller({
            db,
            headers,
            supabase: null as never,
            user: null,
        });

        let error: unknown;

        try {
            await caller.user.upsert({
                id: randomUUID(),
                email: 'unauth@mino.test',
            });
        } catch (caughtError) {
            error = caughtError;
        }

        expect(error).toMatchObject({ code: 'UNAUTHORIZED' });
    });

    test('rejects ownership mismatch between auth user and input', async () => {
        const authUserId = randomUUID();
        const caller = createCaller({
            db,
            headers,
            supabase: null as never,
            user: buildAuthUser(authUserId),
        });

        let error: unknown;

        try {
            await caller.user.upsert({
                id: randomUUID(),
                email: `${authUserId}@mino.test`,
            });
        } catch (caughtError) {
            error = caughtError;
        }

        expect(error).toMatchObject({ code: 'FORBIDDEN' });
    });

    test('inserts and updates the same user with explicit conflict fields', async () => {
        if (!hasDatabaseConnection) {
            console.warn(
                'Skipping DB mutation assertions: local Supabase database is unreachable.',
            );
            return;
        }

        const userId = randomUUID();
        createdIds.add(userId);

        const caller = createCaller({
            db,
            headers,
            supabase: null as never,
            user: buildAuthUser(userId),
        });

        const inserted = await caller.user.upsert({ id: userId, email: null });
        expect(inserted?.firstName).toBe('Edge');
        expect(inserted?.lastName).toBe('Case Tester');
        expect(inserted?.displayName).toBe('Edge Case Tester');

        const updated = await caller.user.upsert({
            id: userId,
            email: 'updated@mino.test',
            displayName: 'Readable Name',
        });

        expect(updated?.id).toBe(userId);
        expect(updated?.email).toBe('updated@mino.test');
        expect(updated?.displayName).toBe('Readable Name');

        const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        expect(dbUser?.id).toBe(userId);
        expect(dbUser?.displayName).toBe('Readable Name');
        expect(dbUser?.email).toBe('updated@mino.test');
    });
});

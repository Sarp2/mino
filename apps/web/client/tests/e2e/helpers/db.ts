import type { User as AuthUser } from '@supabase/supabase-js';

import {
    branches,
    canvases,
    db,
    frames,
    projects,
    userCanvases,
    users,
} from '@mino/db';

import { getUserName } from '@/utils/helpers/get-user-name';

export const createDatabaseUser = async (authUser: AuthUser) => {
    const { firstName, lastName, displayName } = getUserName(authUser);

    await db.insert(users).values({
        id: authUser.id,
        firstName,
        lastName,
        displayName,
        avatarUrl:
            typeof authUser.user_metadata.avatar_url === 'string'
                ? authUser.user_metadata.avatar_url
                : null,
        email: authUser.email ?? null,
    });
};

export const cleanupAllProjectTables = async (): Promise<void> => {
    await db.transaction(async (tx) => {
        await tx.delete(users);
        await tx.delete(projects);
        await tx.delete(branches);
        await tx.delete(frames);
        await tx.delete(canvases);
        await tx.delete(userCanvases);
    });
};

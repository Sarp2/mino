import type { User } from '@mino/db';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { userInsertSchema, users } from '@mino/db';
import { extractNames } from '@mino/utility';

import { createTRPCRouter, proctedProcedure } from '../../trpc';

export const userRouter = createTRPCRouter({
    upsert: proctedProcedure
        .input(userInsertSchema)
        .mutation(async ({ ctx, input }): Promise<User | null> => {
            const authUser = ctx.user;

            // TODO: Use existingUser for webhooks in the future
            // const existingUser = await ctx.db.query.users.findFirst({
            // where: eq,
            // });

            const { firstName, lastName, displayName } = getUserName(authUser);

            const userData = {
                id: input.id,
                firstName: input.firstName ?? firstName,
                lastName: input.lastName ?? lastName,
                displayName: input.displayName ?? displayName,
                email: input.email ?? authUser.email,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                avatarUrl: input.avatarUrl ?? authUser.user_metadata.avatar_url,
            };

            const [user] = await ctx.db
                .insert(users)
                .values(userData)
                .onConflictDoUpdate({
                    target: [users.id],
                    set: {
                        ...userData,
                        updatedAt: new Date(),
                    },
                })
                .returning();

            return user ?? null;
        }),
});

/**
 * Derives a display name, first name, and last name from a Supabase user object's metadata.
 *
 * @param authUser - Supabase user object whose `user_metadata` and `app_metadata` fields are inspected for name values
 * @returns An object with:
 *   - `displayName`: the chosen display name (empty string if none found)
 *   - `firstName`: the extracted first name
 *   - `lastName`: the extracted last name
 */
function getUserName(authUser: SupabaseUser) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const displayName: string | undefined =
        authUser.user_metadata.name ??
        authUser.user_metadata.display_name ??
        authUser.user_metadata.full_name ??
        authUser.app_metadata.first_name ??
        authUser.app_metadata.last_name ??
        authUser.app_metadata.given_name ??
        authUser.user_metadata.family_name;

    const { firstName, lastName } = extractNames(displayName ?? '');
    return {
        displayName: displayName ?? '',
        firstName,
        lastName,
    };
}
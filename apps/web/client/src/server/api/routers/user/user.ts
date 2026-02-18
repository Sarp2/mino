import { TRPCError } from '@trpc/server';

import type { User } from '@mino/db';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { userInsertSchema, users } from '@mino/db';
import { extractNames } from '@mino/utility';

import { createTRPCRouter, protectedProcedure } from '../../trpc';

export const userRouter = createTRPCRouter({
    upsert: protectedProcedure
        .input(userInsertSchema)
        .mutation(async ({ ctx, input }): Promise<User | null> => {
            const authUser = ctx.user;

            if (input.id !== authUser.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message:
                        'You are not allowed to update another user record',
                });
            }

            // TODO: Use existingUser for webhooks in the future
            // const existingUser = await ctx.db.query.users.findFirst({
            // where: eq,
            // });

            const { firstName, lastName, displayName } = getUserName(authUser);

            const userData = {
                id: authUser.id,
                firstName: input.firstName ?? firstName,
                lastName: input.lastName ?? lastName,
                displayName: input.displayName ?? displayName,
                email: input.email ?? authUser.email,
                avatarUrl:
                    input.avatarUrl ??
                    (authUser.user_metadata.avatar_url as string | undefined),
            };

            // If user hasn't been created before, create the user. If it is created before, update some specific fields
            const [user] = await ctx.db
                .insert(users)
                .values(userData)
                .onConflictDoUpdate({
                    target: [users.id],
                    set: {
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        displayName: userData.displayName,
                        email: userData.email,
                        avatarUrl: userData.avatarUrl,
                        updatedAt: new Date(),
                    },
                })
                .returning();

            return user ?? null;
        }),
});

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

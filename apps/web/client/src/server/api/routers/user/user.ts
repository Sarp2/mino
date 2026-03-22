import { TRPCError } from '@trpc/server';

import type { User } from '@mino/db';

import { userInsertSchema, users } from '@mino/db';
import { encrypt } from '@mino/utility';

import { getUserName } from '@/utils/helpers/get-user-name';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

export const userRouter = createTRPCRouter({
    upsert: protectedProcedure
        .input(userInsertSchema)
        .mutation(async ({ ctx, input }): Promise<User | null> => {
            const authUser = ctx.user;
            const provider = authUser.app_metadata?.provider;
            const {
                data: { session },
            } = await ctx.supabase.auth.getSession();

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
                // Only include the githubAccessToken if it's actually a GitHub login
                ...(provider === 'github' &&
                    session?.provider_token && {
                        githubAccessToken: encrypt(session.provider_token),
                    }),
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
                        ...(provider === 'github' &&
                            session?.provider_token && {
                                githubAccessToken: session.provider_token,
                            }),
                    },
                })
                .returning()
                .catch((error: Error) => {
                    console.error('Failed to upsert user:', error.message);
                    throw new TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to upsert user',
                        cause: error.message,
                    });
                });

            return user ?? null;
        }),
    get: protectedProcedure.query(async ({ ctx }) => {
        const authUser = ctx.user;

        const user = await ctx.db.query.users.findFirst({
            where: eq(users.id, authUser.id),
        });
        return user;
    }),
});

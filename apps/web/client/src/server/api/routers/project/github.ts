import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import { users } from '@mino/db';

import { getOctokit } from '@/utils/octokit/octokit';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

export const githubRouter = createTRPCRouter({
    getRepos: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.query.users.findFirst({
            where: eq(users.id, ctx.user.id),
        });

        if (!user) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'User not found.',
            });
        }

        if (!user.githubAccessToken) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'No GitHub token found. Please re-login with GitHub.',
            });
        }

        const octokit = getOctokit(user.githubAccessToken);

        const { data: repos } =
            await octokit.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
            });
        return repos;
    }),
});

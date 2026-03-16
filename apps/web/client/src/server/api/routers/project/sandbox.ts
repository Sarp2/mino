import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import type { CodeSandboxProvider } from '@mino/code-provider/src/providers/codesandbox';

import { branches } from '@mino/db';
import { shortenUuid } from '@mino/utility';

import { getProvider } from '@/utils/helpers/get-provider';
import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { verifyProjectAccess } from './helpers';

export const sandboxRouter = createTRPCRouter({
    start: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            const isAuthorized = await verifyProjectAccess(
                ctx.db,
                ctx.user.id,
                input.projectId,
            );

            if (isAuthorized === false) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Forbidden',
                });
            }

            const branch = await ctx.db.query.branches.findFirst({
                where: and(
                    eq(branches.projectId, input.projectId),
                    eq(branches.isDefault, true),
                ),
            });

            if (!branch) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Default branch not found',
                });
            }

            const provider = (await getProvider({
                sandboxId: branch.sandboxId,
                userId,
            })) as CodeSandboxProvider;

            try {
                return await provider.createSession({
                    args: {
                        id: shortenUuid(userId, 20),
                    },
                });
            } finally {
                await provider.destroy().catch((error: unknown) => {
                    console.error('Failed to destroy provider', error);
                });
            }
        }),

    hibernate: protectedProcedure
        .input(
            z.object({
                sandboxId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const provider = await getProvider({ sandboxId: input.sandboxId });
            try {
                await provider.pauseProject({});
            } finally {
                await provider.destroy().catch((error: unknown) => {
                    console.error('Failed to destroy provider', error);
                });
            }
        }),

    delete: protectedProcedure
        .input(
            z.object({
                sandboxId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const provider = await getProvider({ sandboxId: input.sandboxId });
            try {
                await provider.stopProject({});
            } finally {
                await provider.destroy().catch((error: unknown) => {
                    console.error('Failed to destroy provider', error);
                });
            }
        }),
});

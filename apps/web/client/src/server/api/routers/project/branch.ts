import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import { branches, branchInsertSchema, branchUpdateSchema } from '@mino/db';

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { verifyProjectAccess } from './helpers';

export const branchRouter = createTRPCRouter({
    getByProjectId: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                onlyDefault: z.boolean().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
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

            const dbBranches = await ctx.db.query.branches.findMany({
                where: input.onlyDefault
                    ? and(
                          eq(branches.isDefault, true),
                          eq(branches.projectId, input.projectId),
                      )
                    : eq(branches.projectId, input.projectId),
            });

            if (!dbBranches || dbBranches.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Branches not found',
                });
            }

            return dbBranches;
        }),
    create: protectedProcedure
        .input(branchInsertSchema)
        .mutation(async ({ ctx, input }) => {
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

            try {
                await ctx.db.insert(branches).values(input);
                return true;
            } catch {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error. Please try again later.',
                });
            }
        }),
    update: protectedProcedure
        .input(branchUpdateSchema)
        .mutation(async ({ ctx, input }) => {
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

            try {
                await ctx.db
                    .update(branches)
                    .set({ ...input, updatedAt: new Date() })
                    .where(
                        and(
                            eq(branches.id, input.id),
                            eq(branches.projectId, input.projectId),
                        ),
                    );
                return true;
            } catch {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error. Please try again later.',
                });
            }
        }),
    delete: protectedProcedure
        .input(
            z.object({
                branchId: z.string(),
                projectId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
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

            try {
                await ctx.db
                    .delete(branches)
                    .where(
                        and(
                            eq(branches.id, input.branchId),
                            eq(branches.projectId, input.projectId),
                        ),
                    );
                return true;
            } catch {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Internal server error. Please try again later.',
                });
            }
        }),
});

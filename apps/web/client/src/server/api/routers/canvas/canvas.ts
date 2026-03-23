import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import { projects, userCanvases, userCanvasUpdateSchema } from '@mino/db';

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { verifyProjectAccess } from '../project/helpers';

export const userCanvasRouter = createTRPCRouter({
    update: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                canvasId: z.string(),
                canvas: userCanvasUpdateSchema,
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
                    .update(userCanvases)
                    .set(input.canvas)
                    .where(
                        and(
                            eq(userCanvases.canvasId, input.canvasId),
                            eq(userCanvases.userId, ctx.user.id),
                        ),
                    );
                await ctx.db
                    .update(projects)
                    .set({ updatedAt: new Date() })
                    .where(eq(projects.id, input.projectId));
                return true;
            } catch (error) {
                console.error('Error updating user canvas', error);
                return false;
            }
        }),
});

import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import z from 'zod';

import {
    branches,
    canvases,
    createDefaultBranch,
    createDefaultCanvas,
    createDefaultFrame,
    createDefaultUserCanvas,
    DefaultFrameType,
    frames,
    projectInsertSchema,
    projects,
    projectUpdateSchema,
    userCanvases,
} from '@mino/db';

import { getProvider } from '@/utils/helpers/get-provider';
import { createSandboxFromGithub } from '@/utils/sandbox/github';
import { createSandboxFromTemplate } from '@/utils/sandbox/template';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

export const projectRouter = createTRPCRouter({
    get: protectedProcedure
        .input(z.object({ projectId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const project = await ctx.db.query.projects.findFirst({
                where: and(
                    eq(projects.id, input.projectId),
                    eq(projects.userId, ctx.user.id),
                ),
            });

            if (!project) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Project not found',
                });
            }

            return project;
        }),
    createGithubProject: protectedProcedure
        .input(
            z.object({
                project: projectInsertSchema.omit({ userId: true }),
                gitRepoUrl: z.url(),
                gitBranch: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Create the sandbox
            const { sandboxId, sandboxUrl } = await createSandboxFromGithub(
                input.gitRepoUrl,
                input.gitBranch,
            );

            if (!sandboxId || !sandboxUrl) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message:
                        'We are having problem on sandbox. Please try again later.',
                });
            }

            try {
                return await ctx.db.transaction(async (tx) => {
                    // // 1. Create the project
                    const [newProject] = await tx
                        .insert(projects)
                        .values({
                            ...input.project,
                            userId: ctx.user.id,
                        })
                        .returning();

                    if (!newProject) {
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create project',
                        });
                    }

                    // 2. Create branch
                    const newBranch = createDefaultBranch({
                        projectId: newProject.id,
                        sandboxId: sandboxId,
                        overrides: {
                            gitRepoUrl: input.gitRepoUrl ?? null,
                            gitBranch: input.gitBranch ?? null,
                        },
                    });

                    await tx.insert(branches).values(newBranch);

                    // 3. Create canvas
                    const newCanvas = createDefaultCanvas(newProject.id);
                    await tx.insert(canvases).values(newCanvas);

                    const newUserCanvas = createDefaultUserCanvas(
                        ctx.user.id,
                        newCanvas.id,
                        {
                            x: '120',
                            y: '120',
                            scale: '0.56',
                        },
                    );

                    await tx.insert(userCanvases).values(newUserCanvas);

                    // 5. Create frame
                    const desktopFrame = createDefaultFrame({
                        canvasId: newCanvas.id,
                        branchId: newBranch.id,
                        url: sandboxUrl,
                        type: DefaultFrameType.DESKTOP,
                    });
                    await tx.insert(frames).values(desktopFrame);

                    return { project: newProject, sandboxUrl };
                });
            } catch (error) {
                // delete sandbox if DB transaction fails
                const provider = await getProvider({ sandboxId: sandboxId });
                try {
                    await provider.stopProject({});
                } finally {
                    await provider.destroy().catch((error: unknown) => {
                        console.error('Failed to destroy provider', error);
                    });
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create project',
                    cause: error,
                });
            }
        }),
    createTemplateProject: protectedProcedure
        .input(
            z.object({
                project: projectInsertSchema.omit({ userId: true }),
                templateId: z.string(),
                name: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Create the sandbox
            const { sandboxId, sandboxUrl } = await createSandboxFromTemplate(
                input.name,
                input.templateId,
            );

            try {
                return await ctx.db.transaction(async (tx) => {
                    // // 1. Create the project
                    const [newProject] = await tx
                        .insert(projects)
                        .values({
                            ...input.project,
                            userId: ctx.user.id,
                        })
                        .returning();

                    if (!newProject) {
                        throw new TRPCError({
                            code: 'INTERNAL_SERVER_ERROR',
                            message: 'Failed to create project',
                        });
                    }

                    // 2. Create branch
                    const newBranch = createDefaultBranch({
                        projectId: newProject.id,
                        sandboxId: sandboxId,
                    });

                    await tx.insert(branches).values(newBranch);

                    // 3. Create canvas
                    const newCanvas = createDefaultCanvas(newProject.id);
                    await tx.insert(canvases).values(newCanvas);

                    const newUserCanvas = createDefaultUserCanvas(
                        ctx.user.id,
                        newCanvas.id,
                        {
                            x: '120',
                            y: '120',
                            scale: '0.56',
                        },
                    );

                    await tx.insert(userCanvases).values(newUserCanvas);

                    // 5. Create frame
                    const desktopFrame = createDefaultFrame({
                        canvasId: newCanvas.id,
                        branchId: newBranch.id,
                        url: sandboxUrl,
                        type: DefaultFrameType.DESKTOP,
                    });
                    await tx.insert(frames).values(desktopFrame);

                    return { project: newProject, sandboxUrl };
                });
            } catch (error) {
                // delete sandbox if DB transaction fails
                const provider = await getProvider({ sandboxId: sandboxId });
                try {
                    await provider.stopProject({});
                } finally {
                    await provider.destroy().catch((error: unknown) => {
                        console.error('Failed to destroy provider', error);
                    });
                }

                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create project',
                    cause: error,
                });
            }
        }),
    update: protectedProcedure
        .input(projectUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const [updatedProject] = await ctx.db
                .update(projects)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(
                    and(eq(projects.id, id), eq(projects.userId, ctx.user.id)),
                )
                .returning();

            if (!updatedProject) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Project not found',
                });
            }

            return updatedProject;
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const deleted = await ctx.db
                .delete(projects)
                .where(
                    and(
                        eq(projects.id, input.id),
                        eq(projects.userId, ctx.user.id),
                    ),
                )
                .returning({ id: projects.id });

            if (deleted.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Project not found',
                });
            }
        }),
    list: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projects.findMany({
            where: eq(projects.userId, ctx.user.id),
            orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
        });
    }),
});

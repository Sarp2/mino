import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

import type { DrizzleDb } from '@mino/db/src/client';

import { users } from '@mino/db';

import { env } from '@/env';
import { createTRPCRouter, protectedProcedure } from '../../trpc';

type ProjectCondition = 'open' | 'closed';

interface GithubProject {
    name: string;
    condition: ProjectCondition;
    startedDate: string;
    isPrivate: boolean;
}

interface GithubProjectsResponse {
    githubName: string;
    projects: GithubProject[];
}

type InstallationOctokit = {
    rest: {
        apps: {
            getInstallation: (params: { installation_id: number }) => Promise<{
                data: {
                    account?: {
                        login?: string | null;
                    } | null;
                };
            }>;
            listReposAccessibleToInstallation: (params: {
                per_page: number;
                page: number;
            }) => Promise<{
                data: {
                    repositories: Array<{
                        name: string;
                        archived: boolean;
                        disabled: boolean;
                        created_at: string;
                        private: boolean;
                    }>;
                };
            }>;
        };
    };
};

async function createInstallationOctokit(
    installationId: number,
): Promise<InstallationOctokit> {
    const [{ Octokit }, { createAppAuth }] = await Promise.all([
        import('octokit'),
        import('@octokit/auth-app'),
    ]);

    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            appId: env.GITHUB_APP_ID,
            privateKey: env.GITHUB_APP_PRIVATE_KEY,
            installationId,
        },
    });

    return octokit as InstallationOctokit;
}

async function getUserGithubInstallation(
    db: DrizzleDb,
    userId: string,
): Promise<{ octokit: InstallationOctokit; installationId: number }> {
    const [user] = await db
        .select({ githubInstallationId: users.githubInstallationId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user?.githubInstallationId) {
        throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'GitHub App installation required',
        });
    }

    const installationId = Number(user.githubInstallationId);

    if (Number.isNaN(installationId)) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid GitHub installation id',
        });
    }

    return {
        installationId,
        octokit: await createInstallationOctokit(installationId),
    };
}

export const githubRouter = createTRPCRouter({
    projects: protectedProcedure.query(
        async ({ ctx }): Promise<GithubProjectsResponse> => {
            try {
                const { octokit, installationId } =
                    await getUserGithubInstallation(ctx.db, ctx.user.id);

                const [installation, repositories] = await Promise.all([
                    octokit.rest.apps.getInstallation({
                        installation_id: installationId,
                    }),
                    octokit.rest.apps.listReposAccessibleToInstallation({
                        per_page: 100,
                        page: 1,
                    }),
                ]);

                return {
                    githubName: installation.data.account?.login ?? 'Unknown',
                    projects: repositories.data.repositories.map(
                        (repository) => ({
                            name: repository.name,
                            condition:
                                repository.archived || repository.disabled
                                    ? 'closed'
                                    : 'open',
                            startedDate: repository.created_at,
                            isPrivate: repository.private,
                        }),
                    ),
                };
            } catch (error) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message:
                        'GitHub App installation is invalid or has been revoked',
                    cause: error,
                });
            }
        },
    ),
});

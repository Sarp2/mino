// utils/services/sandbox.service.ts
import { TRPCError } from '@trpc/server';

import type { SandboxResult } from '@/types';

import {
    CodeProvider,
    getSandboxPreviewUrl,
    getStaticCodeProvider,
} from '@mino/code-provider';

export const createSandboxFromGithub = async (
    repoUrl: string,
    branch: string,
): Promise<SandboxResult> => {
    const MAX_RETRY_ATTEMPTS = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
            const CodesandboxProvider = getStaticCodeProvider(
                CodeProvider.CodeSandbox,
            );

            const createdSandbox =
                await CodesandboxProvider.createProjectFromGit({
                    repoUrl,
                    branch,
                });

            return {
                sandboxId: createdSandbox.id,
                sandboxUrl: getSandboxPreviewUrl(createdSandbox.id, 3000),
            };
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt < MAX_RETRY_ATTEMPTS) {
                await new Promise((resolve) =>
                    setTimeout(resolve, Math.pow(2, attempt) * 1000),
                );
            }
        }
    }

    throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create sandbox from GitHub after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
        cause: lastError,
    });
};

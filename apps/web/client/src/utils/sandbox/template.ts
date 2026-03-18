import { TRPCError } from '@trpc/server';

import type { SandboxResult } from '@/types';

import {
    CodeProvider,
    getSandboxPreviewUrl,
    getStaticCodeProvider,
} from '@mino/code-provider';

export const createSandboxFromTemplate = async (
    templateId: string,
): Promise<SandboxResult> => {
    try {
        const CodesandboxProvider = getStaticCodeProvider(
            CodeProvider.CodeSandbox,
        );

        const createdSandbox = await CodesandboxProvider.createProject({
            source: 'template',
            id: templateId,
        });

        return {
            sandboxId: createdSandbox.id,
            sandboxUrl: getSandboxPreviewUrl(createdSandbox.id, 3000),
        };
    } catch (error) {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create sandbox from template: ${error instanceof Error ? error.message : String(error)}`,
            cause: error,
        });
    }
};

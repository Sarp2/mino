import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import type { GithubRepo, Template } from '@/types';

import { useCreateProject } from '@/hooks/use-create-project';

const mockPush = mock();
const mockInvalidate = mock();
const mockGithubMutate = mock();
const mockTemplateMutate = mock();
const mockToastError = mock();

type MutationCallbacks = {
    onSuccess?: (data: unknown) => void;
    onError?: (error: unknown) => void;
};

const createMutationHook =
    (mutateAsync: ReturnType<typeof mock>) =>
    (callbacks?: MutationCallbacks) => ({
        mutateAsync: async (input: unknown) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const result = await mutateAsync(input);
                callbacks?.onSuccess?.(result);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return result;
            } catch (error) {
                callbacks?.onError?.(error);
            }
        },
        isPending: false,
    });

await mock.module('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

await mock.module('sonner', () => ({
    toast: { error: mockToastError },
}));

await mock.module('@/trpc/react', () => ({
    api: {
        useUtils: () => ({
            project: { list: { invalidate: mockInvalidate } },
        }),
        project: {
            createGithubProject: {
                useMutation: createMutationHook(mockGithubMutate),
            },
            createTemplateProject: {
                useMutation: createMutationHook(mockTemplateMutate),
            },
        },
    },
}));

const mockRepo = {
    name: 'my-repo',
    default_branch: 'main',
    html_url: 'https://github.com/user/my-repo',
} as GithubRepo;

const mockTemplate = {
    name: 'Next.js',
    templateId: 'nextjs',
} as Template;

const render = () => renderHook(() => useCreateProject());

describe('useCreateProject', () => {
    beforeEach(() => {
        mockPush.mockReset();
        mockInvalidate.mockReset();
        mockGithubMutate.mockReset();
        mockTemplateMutate.mockReset();
        mockToastError.mockReset();
        mockInvalidate.mockResolvedValue(undefined);
    });

    test('createFromGithub calls mutate with correct args', async () => {
        mockGithubMutate.mockResolvedValue({ project: { id: '1' } });
        const { result } = render();

        await act(() => result.current.createFromGithub(mockRepo));

        expect(mockGithubMutate).toHaveBeenCalledWith({
            project: { name: 'my-repo' },
            gitBranch: 'main',
            gitRepoUrl: 'https://github.com/user/my-repo',
        });
    });

    test('createFromGithub falls back to main when default_branch is missing', async () => {
        mockGithubMutate.mockResolvedValue({ project: { id: '1' } });
        const { result } = render();

        await act(() =>
            result.current.createFromGithub({
                ...mockRepo,
                default_branch: undefined,
            } as never),
        );

        expect(mockGithubMutate).toHaveBeenCalledWith(
            expect.objectContaining({ gitBranch: 'main' }),
        );
    });

    test('createFromGithub invalidates list and navigates on success', async () => {
        mockGithubMutate.mockResolvedValue({ project: { id: 'abc' } });
        const { result } = render();

        await act(() => result.current.createFromGithub(mockRepo));

        expect(mockInvalidate).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/project/abc');
    });

    test('createFromTemplate calls mutate with correct args', async () => {
        mockTemplateMutate.mockResolvedValue({ project: { id: '2' } });
        const { result } = render();

        await act(() => result.current.createFromTemplate(mockTemplate));

        expect(mockTemplateMutate).toHaveBeenCalledWith({
            project: { name: 'Next.js' },
            templateId: 'nextjs',
        });
    });

    test('createFromTemplate invalidates list and navigates on success', async () => {
        mockTemplateMutate.mockResolvedValue({ project: { id: 'xyz' } });
        const { result } = render();

        await act(() => result.current.createFromTemplate(mockTemplate));

        expect(mockInvalidate).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/project/xyz');
    });

    test('shows toast on mutation error', async () => {
        mockGithubMutate.mockRejectedValue({ message: 'Network error' });
        const { result } = render();

        await act(() => result.current.createFromGithub(mockRepo));

        expect(mockToastError).toHaveBeenCalledWith(
            'Failed to create project',
            {
                description: 'Network error',
            },
        );
    });
});

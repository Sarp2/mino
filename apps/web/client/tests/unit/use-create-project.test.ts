import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import type { GithubRepo, Template } from '@/types';

import { useCreateProject } from '@/hooks/use-create-project';

const mockPush = mock();
const mockInvalidate = mock();
const mockGithubMutate = mock();
const mockTemplateMutate = mock();
const mockToastError = mock();

await mock.module('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
}));

await mock.module('sonner', () => ({
    toast: { error: mockToastError },
}));

await mock.module('@/trpc/react', () => ({
    api: {
        useUtils: () => ({ project: { list: { invalidate: mockInvalidate } } }),
        project: {
            createGithubProject: {
                useMutation: ({
                    onSuccess,
                    onError,
                }: {
                    onSuccess: object;
                    onError: object;
                }) => ({
                    mutateAsync: mockGithubMutate,
                    isPending: false,
                    _callbacks: { onSuccess, onError },
                }),
            },
            createTemplateProject: {
                useMutation: ({
                    onSuccess,
                    onError,
                }: {
                    onSuccess: object;
                    onError: object;
                }) => ({
                    mutateAsync: mockTemplateMutate,
                    isPending: false,
                    _callbacks: { onSuccess, onError },
                }),
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

    test('createFromTemplate calls mutate with correct args', async () => {
        mockTemplateMutate.mockResolvedValue({ project: { id: '2' } });
        const { result } = render();

        await act(() => result.current.createFromTemplate(mockTemplate));

        expect(mockTemplateMutate).toHaveBeenCalledWith({
            project: { name: 'Next.js' },
            templateId: 'nextjs',
        });
    });
});

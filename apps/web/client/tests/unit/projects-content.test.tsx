import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';

import type { GithubRepo } from '@/types';

import { ProjectsContent } from '@/app/projects/_components/projects-content';

/** Happy DOM does not implement pointer capture APIs that Radix Select relies on. */
if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
}

if (!HTMLElement.prototype.setPointerCapture) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    HTMLElement.prototype.setPointerCapture = () => {};
}

if (!HTMLElement.prototype.releasePointerCapture) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    HTMLElement.prototype.releasePointerCapture = () => {};
}

const mockPush = mock();
const mockReplace = mock();
const mockToastError = mock();
const mockInvalidateProjectList = mock();

const mockCreateGithubProjectMutateAsync = mock();
const mockCreateTemplateProjectMutateAsync = mock();
const mockStartProjectMutate = mock();

type QueryState<T> = {
    data: T | undefined;
    error: Error | null;
    isError: boolean;
    isLoading: boolean;
};

let projectListQueryState: QueryState<
    { id: string; name: string; updatedAt: string }[]
> = {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
};

let reposQueryState: QueryState<GithubRepo[]> = {
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
};

let userQueryState: { data: { githubAccessToken: string | null } | undefined } =
    { data: { githubAccessToken: 'token-123' } };

let startProjectIsPending = false;
let createGithubProjectIsPending = false;
let createTemplateProjectIsPending = false;

let mockSourceParam: string | null = null;

const createMutationHook =
    <TResult,>({
        isPending,
        mutateAsync,
        suppressError = false,
    }: {
        isPending: () => boolean;
        mutateAsync: (input: unknown) => Promise<TResult>;
        suppressError?: boolean;
    }) =>
    (options?: {
        onError?: (error: Error) => void;
        onSuccess?: (data: TResult, input: unknown) => Promise<void> | void;
    }) => ({
        isPending: isPending(),
        mutateAsync: async (input: unknown) => {
            try {
                const result = await mutateAsync(input);
                await options?.onSuccess?.(result, input);
                return result;
            } catch (error) {
                options?.onError?.(error as Error);

                if (suppressError) {
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    return new Promise<never>(() => {});
                }

                throw error;
            }
        },
        mutate: (input: unknown) => {
            mutateAsync(input)
                .then((result: TResult) => options?.onSuccess?.(result, input))
                .catch((error: Error) => options?.onError?.(error));
        },
    });

await mock.module('next/navigation', () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    usePathname: () => '/projects',
    useSearchParams: () => ({
        get: (key: string) => (key === 'source' ? mockSourceParam : null),
        toString: () => (mockSourceParam ? `source=${mockSourceParam}` : ''),
    }),
}));

await mock.module('sonner', () => ({
    toast: { error: mockToastError },
}));

await mock.module('@mino/models', () => ({
    SignInMethod: { GITHUB: 'github', GOOGLE: 'google', DEV: 'dev' },
}));

await mock.module('@/app/auth/auth-context', () => ({
    useAuthContext: () => ({
        handleLogin: mock(),
        handleDevLogin: mock(),
        signingInMethod: null,
    }),
}));

await mock.module('next/dist/client/components/redirect-error', () => ({
    isRedirectError: () => false,
}));

await mock.module('@/trpc/react', () => ({
    api: {
        useUtils: () => ({
            project: { list: { invalidate: mockInvalidateProjectList } },
        }),
        user: {
            get: { useQuery: () => userQueryState },
        },
        project: {
            list: {
                useQuery: () => projectListQueryState,
            },
            createGithubProject: {
                useMutation: createMutationHook({
                    isPending: () => createGithubProjectIsPending,
                    mutateAsync: mockCreateGithubProjectMutateAsync,
                }),
            },
            createTemplateProject: {
                useMutation: createMutationHook({
                    isPending: () => createTemplateProjectIsPending,
                    mutateAsync: mockCreateTemplateProjectMutateAsync,
                    suppressError: true,
                }),
            },
        },
        github: {
            getRepos: {
                useQuery: () => reposQueryState,
            },
        },
        sandbox: {
            start: {
                useMutation: createMutationHook({
                    isPending: () => startProjectIsPending,
                    mutateAsync: mockStartProjectMutate,
                    suppressError: true,
                }),
            },
        },
    },
}));

const defaultProjects = [
    {
        id: 'project-1',
        name: 'Alpha Project',
        updatedAt: '2026-03-10T00:00:00.000Z',
    },
];

const defaultRepos = [
    {
        id: 1,
        name: 'alpha-repo',
        full_name: 'owner/alpha-repo',
        html_url: 'https://github.com/owner/alpha-repo',
        default_branch: 'main',
        updated_at: '2026-03-10T00:00:00.000Z',
        private: false,
        owner: { avatar_url: '', login: 'owner' },
    },
] as GithubRepo[];

const setProjectListQueryState = (
    overrides: Partial<QueryState<typeof defaultProjects>>,
) => {
    projectListQueryState = {
        data: defaultProjects,
        error: null,
        isError: false,
        isLoading: false,
        ...overrides,
    };
};

const setReposQueryState = (overrides: Partial<QueryState<GithubRepo[]>>) => {
    reposQueryState = {
        data: defaultRepos,
        error: null,
        isError: false,
        isLoading: false,
        ...overrides,
    };
};

const renderProjectsContent = async () => {
    await act(async () => {
        render(<ProjectsContent />);
        await Promise.resolve();
    });
};

afterEach(() => {
    cleanup();
});

describe('ProjectsContent', () => {
    beforeEach(() => {
        mockPush.mockReset();
        mockReplace.mockReset();
        mockToastError.mockReset();
        mockInvalidateProjectList.mockReset();
        mockCreateGithubProjectMutateAsync.mockReset();
        mockCreateTemplateProjectMutateAsync.mockReset();
        mockStartProjectMutate.mockReset();

        createGithubProjectIsPending = false;
        createTemplateProjectIsPending = false;
        startProjectIsPending = false;

        mockSourceParam = null;
        userQueryState = { data: { githubAccessToken: 'token-123' } };

        setProjectListQueryState({});
        setReposQueryState({});
    });

    test('defaults to projects source and shows project list', async () => {
        await renderProjectsContent();

        expect(screen.getByText('Your Projects')).toBeTruthy();
        expect(screen.getByText('Alpha Project')).toBeTruthy();
    });

    test('shows github source when URL has source=github', async () => {
        mockSourceParam = 'github';
        setReposQueryState({});

        await renderProjectsContent();

        expect(screen.getByText('Import GitHub repository')).toBeTruthy();
        expect(screen.getByText('alpha-repo')).toBeTruthy();
    });

    test('shows templates source when URL has source=templates', async () => {
        mockSourceParam = 'templates';

        await renderProjectsContent();

        expect(screen.getByText('Use a Template')).toBeTruthy();
        expect(screen.getByText('Next.js')).toBeTruthy();
    });

    test('shows connect GitHub prompt when user has no github token', async () => {
        mockSourceParam = 'github';
        userQueryState = { data: { githubAccessToken: null } };

        await renderProjectsContent();

        expect(screen.getByText('Connect your GitHub account')).toBeTruthy();
        expect(screen.getByText('Connect GitHub')).toBeTruthy();
    });

    test('shows connect GitHub prompt on UNAUTHORIZED repo error', async () => {
        mockSourceParam = 'github';
        userQueryState = { data: { githubAccessToken: 'old-token' } };

        const trpcError = Object.assign(new Error('Unauthorized'), {
            data: { code: 'UNAUTHORIZED' },
        });

        setReposQueryState({
            data: undefined,
            error: trpcError,
            isError: true,
        });

        await renderProjectsContent();

        expect(screen.getByText('Connect your GitHub account')).toBeTruthy();
    });

    test('shows empty state when no repositories exist', async () => {
        mockSourceParam = 'github';
        setReposQueryState({ data: [] });

        await renderProjectsContent();

        expect(screen.getByText('No repositories found.')).toBeTruthy();
    });

    test('shows empty state when no projects exist', async () => {
        setProjectListQueryState({ data: [] });

        await renderProjectsContent();

        expect(screen.getByText('No projects yet.')).toBeTruthy();
    });

    test('shows loading rows while projects are loading', async () => {
        setProjectListQueryState({ isLoading: true, data: undefined });

        await renderProjectsContent();

        expect(screen.getByText('Your Projects')).toBeTruthy();
    });

    test('disables action buttons when start mutation is pending', async () => {
        startProjectIsPending = true;

        await renderProjectsContent();

        const button = screen.getAllByRole('button').at(-1);
        expect(button).toBeTruthy();
        expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    test('clicking Open starts sandbox and navigates on success', async () => {
        mockStartProjectMutate.mockResolvedValue({ id: 'session-1' });

        await renderProjectsContent();

        await act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Open' })),
        );

        expect(mockStartProjectMutate).toHaveBeenCalledWith({
            projectId: 'project-1',
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/project/project-1');
        });
    });

    test('failed sandbox start shows toast and does not navigate', async () => {
        mockStartProjectMutate.mockRejectedValue(
            new Error('Sandbox start failed'),
        );

        await renderProjectsContent();

        await act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Open' })),
        );

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalledWith(
                'Failed to start a project',
                { description: 'Sandbox start failed' },
            );
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    test('clicking Start triggers template creation', async () => {
        mockSourceParam = 'templates';
        mockCreateTemplateProjectMutateAsync.mockResolvedValue({
            project: { id: 'template-project-1' },
        });

        await renderProjectsContent();

        await act(() =>
            fireEvent.click(
                screen.getAllByRole('button', { name: 'Start' })[0]!,
            ),
        );

        expect(mockCreateTemplateProjectMutateAsync).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(mockInvalidateProjectList).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith(
                '/project/template-project-1',
            );
        });
    });

    test('search filters current source and shows no-results message', async () => {
        mockSourceParam = 'templates';

        await renderProjectsContent();

        await act(() =>
            fireEvent.change(screen.getByPlaceholderText('Search...'), {
                target: { value: 'does-not-exist' },
            }),
        );

        expect(
            screen.getByText('No results for "does-not-exist".'),
        ).toBeTruthy();
    });
});

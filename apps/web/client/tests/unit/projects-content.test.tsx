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
const mockToastError = mock();
const mockLocalforageGetItem = mock();
const mockInvalidateProjectList = mock();

const mockCreateGithubProjectMutateAsync = mock();
const mockCreateTemplateProjectMutateAsync = mock();
const mockStartProjectMutateAsync = mock();

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

let createGithubProjectIsPending = false;
let createTemplateProjectIsPending = false;
let startProjectIsPending = false;

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
        onSuccess?: (data: TResult) => Promise<void> | void;
    }) => ({
        isPending: isPending(),
        mutateAsync: async (input: unknown) => {
            try {
                const result = await mutateAsync(input);
                await options?.onSuccess?.(result);
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
    });

await mock.module('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

await mock.module('localforage', () => ({
    default: {
        getItem: mockLocalforageGetItem,
    },
}));

await mock.module('sonner', () => ({
    toast: {
        error: mockToastError,
    },
}));

await mock.module('@/trpc/react', () => ({
    api: {
        useUtils: () => ({
            project: {
                list: {
                    invalidate: mockInvalidateProjectList,
                },
            },
        }),
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
                    mutateAsync: mockStartProjectMutateAsync,
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
        owner: {
            avatar_url: '',
            login: 'owner',
        },
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
        mockToastError.mockReset();
        mockLocalforageGetItem.mockReset();
        mockInvalidateProjectList.mockReset();
        mockCreateGithubProjectMutateAsync.mockReset();
        mockCreateTemplateProjectMutateAsync.mockReset();
        mockStartProjectMutateAsync.mockReset();

        createGithubProjectIsPending = false;
        createTemplateProjectIsPending = false;
        startProjectIsPending = false;

        mockLocalforageGetItem.mockResolvedValue(null);

        setProjectListQueryState({});
        setReposQueryState({});
    });

    test('shows loading title and rows before initial source is resolved', async () => {
        setProjectListQueryState({ isLoading: true, data: undefined });

        await renderProjectsContent();

        expect(screen.getByText('Loading...')).toBeTruthy();
        expect(screen.getAllByRole('generic').length).toBeGreaterThan(0);
    });

    test('resolves to projects when projects exist even if provider is github', async () => {
        mockLocalforageGetItem.mockResolvedValue('github');

        await renderProjectsContent();

        await screen.findByText('Your Projects');
        expect(screen.getByText('Alpha Project')).toBeTruthy();
    });

    test('resolves to github when there are no projects and stored provider is github', async () => {
        mockLocalforageGetItem.mockResolvedValue('github');
        setProjectListQueryState({ data: [] });

        await renderProjectsContent();

        await screen.findByText('Import GitHub repository');
        expect(screen.getByText('alpha-repo')).toBeTruthy();
    });

    test('resolves to templates when there are no projects and provider is missing', async () => {
        setProjectListQueryState({ data: [] });

        await renderProjectsContent();

        await screen.findByText('Use a Template');
        expect(screen.getByText('Next.js')).toBeTruthy();
    });

    test('resolves to templates when provider lookup fails', async () => {
        mockLocalforageGetItem.mockRejectedValue(new Error('storage failed'));
        setProjectListQueryState({ data: [] });

        await renderProjectsContent();

        await screen.findByText('Use a Template');
        expect(screen.getByText('Next.js')).toBeTruthy();
    });

    test('renders the GitHub empty state when there are no repositories', async () => {
        mockLocalforageGetItem.mockResolvedValue('github');
        setProjectListQueryState({ data: [] });
        setReposQueryState({ data: [] });

        await renderProjectsContent();

        await screen.findByText('No repositories found.');
    });

    test('renders the GitHub token-specific message when repo query fails with the known error', async () => {
        mockLocalforageGetItem.mockResolvedValue('github');
        setProjectListQueryState({ data: [] });
        setReposQueryState({
            data: undefined,
            error: new Error(
                'No GitHub token found. Please re-login with GitHub.',
            ),
            isError: true,
        });

        await renderProjectsContent();

        await screen.findByText(
            'GitHub is not connected for this account yet. Switch to Templates to start quickly.',
        );
    });

    test('renders the generic GitHub error message for other repo failures', async () => {
        mockLocalforageGetItem.mockResolvedValue('github');
        setProjectListQueryState({ data: [] });
        setReposQueryState({
            data: undefined,
            error: new Error('Failed to load repositories from API'),
            isError: true,
        });

        await renderProjectsContent();

        await screen.findByText('Failed to load repositories from API');
    });

    test('disables project actions when start mutation is pending', async () => {
        startProjectIsPending = true;

        await renderProjectsContent();

        const button = screen.getAllByRole('button').at(-1);
        expect(button).toBeTruthy();
        expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    test('clicking Open starts the sandbox and navigates to the project page', async () => {
        mockStartProjectMutateAsync.mockResolvedValue({ id: 'session-1' });

        await renderProjectsContent();

        await act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Open' })),
        );

        expect(mockStartProjectMutateAsync).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/project/project-1');
        });
    });

    test('clicking Start triggers template creation and navigates on success', async () => {
        setProjectListQueryState({ data: [] });
        mockCreateTemplateProjectMutateAsync.mockResolvedValue({
            sandboxUrl: 'https://sandbox.example',
            project: {
                id: 'template-project-1',
            },
        });

        await renderProjectsContent();

        await screen.findByText('Use a Template');

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

    test('failed sandbox start shows a toast and does not navigate', async () => {
        mockStartProjectMutateAsync.mockRejectedValue(
            new Error('Sandbox start failed'),
        );

        await renderProjectsContent();

        await act(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Open' })),
        );

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalledWith(
                'Failed to start a project',
                {
                    description: 'Sandbox start failed',
                },
            );
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    test('failed create mutation shows a toast error', async () => {
        setProjectListQueryState({ data: [] });
        mockCreateTemplateProjectMutateAsync.mockRejectedValue(
            new Error('Template creation failed'),
        );

        await renderProjectsContent();

        await screen.findByText('Use a Template');

        await act(() =>
            fireEvent.click(
                screen.getAllByRole('button', { name: 'Start' })[0]!,
            ),
        );

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalledWith(
                'Failed to create project',
                {
                    description: 'Template creation failed',
                },
            );
        });
    });

    test('search shows no results when the current source has no matches', async () => {
        setProjectListQueryState({ data: [] });

        await renderProjectsContent();

        await screen.findByText('Use a Template');

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

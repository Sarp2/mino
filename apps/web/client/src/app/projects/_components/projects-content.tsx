'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import localforage from 'localforage';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

import type { GithubRepo, SourceType, Template } from '@/types';

import { Icons } from '@mino/ui/icons';
import { formatUpdatedAt } from '@mino/utility';

import { useFilteredList } from '@/hooks/use-filtered-list';
import { api } from '@/trpc/react';
import {
    MAX_VISIBLE_PROJECTS,
    MAX_VISIBLE_REPOS,
    MAX_VISIBLE_TEMPLATES,
    PROVIDER_STORAGE_KEY,
    Templates,
} from '@/utils/constants';
import { getTemplateIcon } from '@/utils/helpers/get-template-icon';
import {
    matchesProject,
    matchesRepo,
    matchesTemplate,
} from '@/utils/helpers/matches';
import { ActionButton } from './action-button';
import { LoadingRows } from './loading-rows';
import { TopBar } from './top-bar';

export const ProjectsContent = () => {
    const utils = api.useUtils();
    const router = useRouter();

    const [provider, setProvider] = useState<string | null>(null);
    const [source, setSource] = useState<SourceType>('projects');
    const [isProviderResolved, setIsProviderResolved] = useState(false);
    const [isInitialSourceResolved, setIsInitialSourceResolved] =
        useState(false);
    const [search, setSearch] = useState('');

    const {
        data: projectList,
        isLoading: isProjectsLoading,
        isError: isProjectsError,
        error: projectsError,
    } = api.project.list.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });

    const {
        data: repos,
        isLoading: isReposLoading,
        isError: isReposError,
        error: reposError,
    } = api.github.getRepos.useQuery(undefined, {
        staleTime: 5 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        enabled: isInitialSourceResolved && source === 'github',
    });

    useEffect(() => {
        let isCancelled = false;

        const resolveProvider = async () => {
            let resolvedProvider: string | null = null;

            try {
                const storedProvider =
                    await localforage.getItem<string>(PROVIDER_STORAGE_KEY);
                resolvedProvider =
                    typeof storedProvider === 'string' ? storedProvider : null;
            } catch {
                resolvedProvider = null;
            }

            if (isCancelled) return;

            setProvider(resolvedProvider);
            setIsProviderResolved(true);
        };

        void resolveProvider();

        return () => {
            isCancelled = true;
        };
    }, []);

    useEffect(() => {
        if (
            isInitialSourceResolved ||
            !isProviderResolved ||
            isProjectsLoading
        ) {
            return;
        }

        if ((projectList?.length ?? 0) > 0) {
            setSource('projects');
        } else {
            setSource(provider === 'github' ? 'github' : 'templates');
        }

        setIsInitialSourceResolved(true);
    }, [
        isInitialSourceResolved,
        isProjectsLoading,
        isProviderResolved,
        projectList,
        provider,
    ]);

    const filteredRepos = useFilteredList(
        repos,
        search,
        matchesRepo,
        MAX_VISIBLE_REPOS,
    );

    const filteredProjects = useFilteredList(
        projectList,
        search,
        matchesProject,
        MAX_VISIBLE_PROJECTS,
    );

    const filteredTemplates = useFilteredList(
        Templates,
        search,
        matchesTemplate,
        MAX_VISIBLE_TEMPLATES,
    );

    const createGithubProjectMutation =
        api.project.createGithubProject.useMutation({
            onSuccess: async (data) => {
                await utils.project.list.invalidate();
                router.push(`/project/${data.project.id}`);
            },
            onError: (error) => {
                toast.error('Failed to create project', {
                    description: error.message,
                });
            },
        });

    const createTemplateProjectMutation =
        api.project.createTemplateProject.useMutation({
            onSuccess: async (data) => {
                await utils.project.list.invalidate();
                router.push(`/project/${data.project.id}`);
            },
            onError: (error) => {
                toast.error('Failed to create project', {
                    description: error.message,
                });
            },
        });

    const startProjectMutation = api.sandbox.start.useMutation({
        onError: (error) => {
            toast.error('Failed to start a project', {
                description: error.message,
            });
        },
    });

    const isCreating =
        createGithubProjectMutation.isPending ||
        createTemplateProjectMutation.isPending ||
        startProjectMutation.isPending;

    const createGithubProject = async (repo: GithubRepo) => {
        const branch = repo.default_branch ?? 'main';
        await createGithubProjectMutation.mutateAsync({
            project: {
                name: repo.name,
            },
            gitBranch: branch,
            gitRepoUrl: repo.html_url,
        });
    };

    const createTemplateProject = async (template: Template) => {
        await createTemplateProjectMutation.mutateAsync({
            project: {
                name: template.name,
            },
            templateId: template.templateId,
        });
    };

    const startProject = async (projectId: string) => {
        await startProjectMutation.mutateAsync({
            projectId,
        });
        router.push(`/project/${projectId}`);
    };

    const title = !isInitialSourceResolved
        ? 'Loading...'
        : source === 'projects'
          ? 'Your Projects'
          : source === 'github'
            ? 'Import GitHub repository'
            : 'Use a Template';

    const renderProjects = () => {
        if (isProjectsLoading) return <LoadingRows />;
        if (isProjectsError) {
            return (
                <div className="text-destructive bg-destructive/5 px-5 py-4 text-sm">
                    {projectsError?.message ?? 'Failed to load projects'}
                </div>
            );
        }
        if (filteredProjects.length === 0) {
            return (
                <div className="text-muted-foreground px-5 py-8 text-center text-sm">
                    No projects yet.
                </div>
            );
        }

        return filteredProjects.map((project) => (
            <div
                key={project.id}
                className="border-input bg-background flex min-h-[64px] items-center justify-between border-b px-4 last:border-b-0"
            >
                <div className="min-w-0">
                    <div className="text-foreground flex items-center gap-2 text-base">
                        <div className="bg-muted flex size-7 items-center justify-center rounded-full">
                            <Icons.Projects className="size-4" />
                        </div>
                        <span className="truncate font-normal">
                            {project.name}
                        </span>
                        <span className="text-muted-foreground text-sm font-normal">
                            · {formatUpdatedAt(String(project.updatedAt))}
                        </span>
                    </div>
                </div>

                <ActionButton
                    isCreating={isCreating}
                    label="Open"
                    onClick={() => {
                        void startProject(project.id);
                    }}
                />
            </div>
        ));
    };

    const renderGithub = () => {
        if (isReposLoading) return <LoadingRows />;
        if (isReposError) {
            return (
                <div className="text-destructive bg-destructive/5 px-5 py-4 text-sm">
                    {reposError?.message ===
                    'No GitHub token found. Please re-login with GitHub.'
                        ? 'GitHub is not connected for this account yet. Switch to Templates to start quickly.'
                        : (reposError?.message ??
                          'Failed to load repositories')}
                </div>
            );
        }
        if ((repos?.length ?? 0) === 0) {
            return (
                <div className="text-muted-foreground px-5 py-8 text-center text-sm">
                    No repositories found.
                </div>
            );
        }
        if (filteredRepos.length === 0) {
            return (
                <div className="text-muted-foreground px-5 py-8 text-center text-sm">
                    No results for &quot;{search}&quot;.
                </div>
            );
        }

        return filteredRepos.map((repo) => (
            <div
                key={repo.id}
                className="border-input bg-background flex min-h-[64px] items-center justify-between border-b px-4 last:border-b-0"
            >
                <div className="min-w-0">
                    <div className="text-foreground flex items-center gap-2 text-base">
                        {repo.owner?.avatar_url ? (
                            <Image
                                src={repo.owner.avatar_url}
                                alt={repo.owner.login ?? repo.name}
                                width={28}
                                height={28}
                                className="size-7 rounded-full border border-zinc-200 object-cover"
                            />
                        ) : (
                            <div className="bg-muted flex size-7 items-center justify-center rounded-full">
                                <Icons.Github className="size-4" />
                            </div>
                        )}

                        <span className="truncate font-normal">
                            {repo.name}
                        </span>

                        {repo.private ? (
                            <span className="text-muted-foreground mr-2 inline-flex items-center">
                                <Lock className="size-3.5" />
                            </span>
                        ) : null}

                        <span className="text-muted-foreground text-sm font-normal">
                            · {formatUpdatedAt(repo.updated_at)}
                        </span>
                    </div>
                </div>

                <ActionButton
                    isCreating={isCreating}
                    label="Import"
                    onClick={() => {
                        void createGithubProject(repo);
                    }}
                />
            </div>
        ));
    };

    const renderTemplates = () => {
        if (filteredTemplates.length === 0) {
            return (
                <div className="text-muted-foreground px-5 py-8 text-center text-sm">
                    No results for &quot;{search}&quot;.
                </div>
            );
        }

        return filteredTemplates.map((template) => (
            <div
                key={template.id}
                className="border-input bg-background flex min-h-[64px] items-center justify-between border-b px-4 last:border-b-0"
            >
                <div className="min-w-0">
                    <div className="text-foreground flex items-center gap-2 text-base">
                        <div className="bg-muted flex size-7 items-center justify-center rounded-full">
                            {getTemplateIcon(template.id)}
                        </div>
                        <span className="truncate font-normal">
                            {template.name}
                        </span>
                        <span className="text-muted-foreground text-sm font-normal">
                            · {template.description}
                        </span>
                    </div>
                </div>

                <ActionButton
                    isCreating={isCreating}
                    label="Start"
                    onClick={() => {
                        void createTemplateProject(template);
                    }}
                />
            </div>
        ));
    };

    const renderContent = () => {
        if (!isInitialSourceResolved) return <LoadingRows />;
        if (source === 'projects') return renderProjects();
        if (source === 'github') return renderGithub();
        return renderTemplates();
    };

    return (
        <main className="bg-background min-h-screen px-6 py-6 font-sans">
            <div className="mx-auto mt-[22vh] w-full max-w-[620px]">
                <TopBar
                    title={title}
                    source={source}
                    search={search}
                    disabled={!isInitialSourceResolved}
                    onSourceChange={setSource}
                    onSearchChange={setSearch}
                />

                <div className="border-input overflow-hidden rounded-lg border">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
};

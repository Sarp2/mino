'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { SignInMethod } from '@mino/models';
import { Icons } from '@mino/ui/icons';
import { formatUpdatedAt } from '@mino/utility';

import { LoginButton } from '@/app/_components/login-button';
import { useCreateProject } from '@/hooks/use-create-project';
import { useFilteredList } from '@/hooks/use-filtered-list';
import { useProjectSource } from '@/hooks/use-project-source';
import { api } from '@/trpc/react';
import {
    MAX_VISIBLE_PROJECTS,
    MAX_VISIBLE_REPOS,
    MAX_VISIBLE_TEMPLATES,
    Source,
    SOURCE_SEARCH_PARAM_KEY,
    Templates,
} from '@/utils/constants';
import { getTemplateIcon } from '@/utils/helpers/get-template-icon';
import {
    matchesProject,
    matchesRepo,
    matchesTemplate,
} from '@/utils/helpers/matches';
import { ListRow } from './list-row';
import { LoadingRows } from './loading-rows';
import { TopBar } from './top-bar';

const SOURCE_TITLES: Record<string, string> = {
    projects: 'Your Projects',
    github: 'Import GitHub repository',
    templates: 'Use a Template',
};

export const ProjectsContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState('');

    const sourceParam = searchParams.get(SOURCE_SEARCH_PARAM_KEY);
    const urlSource =
        sourceParam === Source.GITHUB || sourceParam === Source.TEMPLATES
            ? sourceParam
            : undefined;

    const { source, isResolved, changeSource } = useProjectSource({
        forcedSource: urlSource,
    });

    const { data: user } = api.user.get.useQuery();

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
        enabled:
            isResolved &&
            source === Source.GITHUB &&
            Boolean(user?.githubAccessToken),
    });

    const filteredProjects = useFilteredList(
        projectList,
        search,
        matchesProject,
        MAX_VISIBLE_PROJECTS,
    );
    const filteredRepos = useFilteredList(
        repos,
        search,
        matchesRepo,
        MAX_VISIBLE_REPOS,
    );
    const filteredTemplates = useFilteredList(
        Templates,
        search,
        matchesTemplate,
        MAX_VISIBLE_TEMPLATES,
    );

    const {
        createFromGithub,
        createFromTemplate,
        isCreating: isCreatingGithubOrTemplate,
    } = useCreateProject();

    const startProjectMutation = api.sandbox.start.useMutation({
        onSuccess: (_, { projectId }) => {
            router.push(`/project/${projectId}`);
        },
        onError: (error) => {
            toast.error('Failed to start a project', {
                description: error.message,
            });
        },
    });

    const isCreating =
        isCreatingGithubOrTemplate || startProjectMutation.isPending;

    // ── Render sections ────────────────────────────────────────────────

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
            return <Empty>No projects yet.</Empty>;
        }

        return filteredProjects.map((project) => (
            <ListRow
                key={project.id}
                icon={{
                    type: 'icon',
                    icon: <Icons.Projects className="size-4" />,
                }}
                name={project.name}
                meta={formatUpdatedAt(String(project.updatedAt))}
                actionLabel="Open"
                isCreating={isCreating}
                onClick={() =>
                    startProjectMutation.mutate({ projectId: project.id })
                }
            />
        ));
    };

    const renderGithub = () => {
        const isUnauthorized = reposError?.data?.code === 'UNAUTHORIZED';

        if (isReposLoading) return <LoadingRows />;

        if (!user?.githubAccessToken || (isReposError && isUnauthorized)) {
            return (
                <div className="flex flex-col items-center gap-5 px-8 py-10">
                    <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                        <Icons.Github className="size-7" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <p className="text-foreground text-sm font-medium">
                            Connect your GitHub account
                        </p>
                        <p className="text-muted-foreground max-w-[280px] text-center text-sm leading-relaxed">
                            To import repositories, you need to connect GitHub
                            to your Mino account first.
                        </p>
                    </div>
                    <LoginButton
                        content="Connect GitHub"
                        method={SignInMethod.GITHUB}
                        providerName="github"
                        className="bg-foreground text-background hover:bg-foreground/90 flex h-10 w-[200px] items-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors"
                    />
                </div>
            );
        }

        if ((repos?.length ?? 0) === 0) {
            return <Empty>No repositories found.</Empty>;
        }
        if (filteredRepos.length === 0) {
            return <Empty>No results for &quot;{search}&quot;.</Empty>;
        }

        return filteredRepos.map((repo) => (
            <ListRow
                key={repo.id}
                icon={
                    repo.owner?.avatar_url
                        ? {
                              type: 'image',
                              src: repo.owner.avatar_url,
                              alt: repo.owner.login ?? repo.name,
                          }
                        : {
                              type: 'icon',
                              icon: <Icons.Github className="size-4" />,
                          }
                }
                name={repo.name}
                meta={formatUpdatedAt(repo.updated_at)}
                isPrivate={repo.private}
                actionLabel="Import"
                isCreating={isCreating}
                onClick={() => void createFromGithub(repo)}
            />
        ));
    };

    const renderTemplates = () => {
        if (filteredTemplates.length === 0) {
            return <Empty>No results for &quot;{search}&quot;.</Empty>;
        }

        return filteredTemplates.map((template) => (
            <ListRow
                key={template.id}
                icon={{ type: 'icon', icon: getTemplateIcon(template.id) }}
                name={template.name}
                meta={template.description}
                actionLabel="Start"
                isCreating={isCreating}
                onClick={() => void createFromTemplate(template)}
            />
        ));
    };

    const renderContent = () => {
        if (!isResolved) return <LoadingRows />;
        if (source === 'projects') return renderProjects();
        if (source === 'github') return renderGithub();
        if (source === 'templates') return renderTemplates();
    };

    const title = isResolved
        ? (SOURCE_TITLES[source] ?? 'Loading...')
        : 'Loading...';

    return (
        <main className="bg-background min-h-screen px-6 py-6 font-sans">
            <div className="mx-auto mt-[22vh] w-full max-w-[620px]">
                <TopBar
                    title={title}
                    source={source}
                    search={search}
                    disabled={!isResolved}
                    onSourceChange={changeSource}
                    onSearchChange={setSearch}
                />
                <div className="border-input overflow-hidden rounded-lg border">
                    {renderContent()}
                </div>
            </div>
        </main>
    );
};

const Empty = ({ children }: { children: React.ReactNode }) => (
    <div className="text-muted-foreground px-5 py-8 text-center text-sm">
        {children}
    </div>
);

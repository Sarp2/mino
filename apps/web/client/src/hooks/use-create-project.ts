// hooks/use-create-project.ts
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { GithubRepo, Template } from '@/types';

import { api } from '@/trpc/react';

interface UseCreateProjectResult {
    createFromGithub: (repo: GithubRepo) => Promise<void>;
    createFromTemplate: (template: Template) => Promise<void>;
    isCreating: boolean;
}

export function useCreateProject(): UseCreateProjectResult {
    const utils = api.useUtils();
    const router = useRouter();

    const onSuccess = async (projectId: string) => {
        await utils.project.list.invalidate();
        router.push(`/project/${projectId}`);
    };

    const onError = (label: string, message: string) => {
        toast.error(`Failed to ${label}`, { description: message });
    };

    const githubMutation = api.project.createGithubProject.useMutation({
        onSuccess: (data) => onSuccess(data.project.id),
        onError: (error) => onError('create project', error.message),
    });

    const templateMutation = api.project.createTemplateProject.useMutation({
        onSuccess: (data) => onSuccess(data.project.id),
        onError: (error) => onError('create project', error.message),
    });

    const createFromGithub = async (repo: GithubRepo) => {
        await githubMutation.mutateAsync({
            project: { name: repo.name },
            gitBranch: repo.default_branch ?? 'main',
            gitRepoUrl: repo.html_url,
        });
    };

    const createFromTemplate = async (template: Template) => {
        await templateMutation.mutateAsync({
            project: { name: template.name },
            templateId: template.templateId,
        });
    };

    const isCreating = githubMutation.isPending || templateMutation.isPending;

    return { createFromGithub, createFromTemplate, isCreating };
}

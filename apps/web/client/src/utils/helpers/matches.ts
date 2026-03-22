import type { GithubRepo, Template } from '@/types';

export const matchesRepo = (repo: GithubRepo, query: string) =>
    repo.name.toLowerCase().includes(query) ||
    repo.full_name.toLowerCase().includes(query);

export const matchesProject = (project: { name: string }, query: string) =>
    project.name.toLowerCase().includes(query);

export const matchesTemplate = (template: Template, query: string) =>
    template.name.toLowerCase().includes(query) ||
    template.description.toLowerCase().includes(query);

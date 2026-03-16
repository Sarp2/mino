import type { RouterOutputs } from './trpc/react';

export type Template = {
    id: string;
    templateId: string;
    name: string;
    description: string;
};

export type SourceType = 'projects' | 'github' | 'templates';

export type GithubRepo = RouterOutputs['github']['getRepos'][number];

export interface SandboxResult {
    sandboxId: string;
    sandboxUrl: string;
}

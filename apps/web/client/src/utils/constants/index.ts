import type { Template } from '@/types';

export const Routes = {
    HOME: '/',
    LOGIN: '/login',
    PROJECTS: '/projects',
    PROJECT: '/project',
    AUTH_CALLBACK: '/auth/callback',
    ERROR: '/auth/error',
} as const;

export const PROVIDER_STORAGE_KEY = 'provider';

export const Templates: Template[] = [
    {
        id: 'nextjs',
        templateId: 'fxis37',
        name: 'Next.js',
        description: 'React framework for full-stack web applications.',
    },
    {
        id: 'vite',
        templateId: '7rp8q9',
        name: 'Vite',
        description: 'Fast frontend tooling for modern web projects.',
    },
    {
        id: 'nuxt',
        templateId: 'b0tq18',
        name: 'Nuxt',
        description: 'Vue framework for production-ready apps.',
    },
];

export const MAX_VISIBLE_REPOS = 5;
export const MAX_VISIBLE_PROJECTS = 5;
export const MAX_VISIBLE_TEMPLATES = 5;

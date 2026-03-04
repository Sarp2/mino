declare module 'octokit' {
    export class Octokit {
        constructor(options?: Record<string, unknown>);
    }
}

declare module '@octokit/auth-app' {
    export const createAppAuth: unknown;
}

import { httpBatchStreamLink, loggerLink } from '@trpc/client';
import SuperJSON from 'superjson';

/* Resolves the API base URL: browser origin, Vercel URL, or localhost fallback */
export function getBaseUrl() {
    if (typeof window !== 'undefined') return window.location.origin;
    // eslint-disable-next-line no-restricted-properties
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    // eslint-disable-next-line no-restricted-properties
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

/* Shared tRPC transport pipeline: dev logger + batched streaming HTTP link */
export const createLinks = (source: 'react-client' | 'vanilla-client') => [
    loggerLink({
        enabled: (op) =>
            // eslint-disable-next-line no-restricted-properties
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
    }),
    httpBatchStreamLink({
        transformer: SuperJSON,
        url: getBaseUrl() + '/api/trpc',
        headers: () => {
            const headers = new Headers();
            headers.set('x-trpc-source', source);
            return headers;
        },
    }),
];

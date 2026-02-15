'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchStreamLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import { type AppRouter } from '~/server/api/root';
import SuperJSON from 'superjson';

import type { QueryClient } from '@tanstack/react-query';

import { env } from '@/env';
import { createQueryClient } from './query-client';

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return createQueryClient();
    }
    // Browser: use singleton pattern to keep the same query client
    clientQueryClientSingleton ??= createQueryClient();

    return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Provides TRPC and React Query context to its children.
 *
 * @param props.children - The React node(s) to be rendered within the TRPC and QueryClient providers.
 * @returns A React element that renders `children` wrapped with the TRPC `api.Provider` and React Query `QueryClientProvider`.
 */
export function TRPCReactProvider(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    const [trpcClient] = useState(() =>
        api.createClient({
            links: [
                loggerLink({
                    enabled: (op) =>
                        env.NODE_ENV === 'development' ||
                        (op.direction === 'down' && op.result instanceof Error),
                }),
                httpBatchStreamLink({
                    transformer: SuperJSON,
                    url: getBaseUrl() + '/api/trpc',
                    headers: () => {
                        const headers = new Headers();
                        headers.set('x-trpc-source', 'nextjs-react');
                        return headers;
                    },
                }),
            ],
        }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </api.Provider>
        </QueryClientProvider>
    );
}

/**
 * Resolve the application's base URL for the current execution environment.
 *
 * @returns The origin to use for client requests: the browser's `window.location.origin` when running in the browser, `https://{VERCEL_URL}` when `VERCEL_URL` is set on the server, or `http://localhost:{PORT}` where `PORT` defaults to `3000`.
 */
function getBaseUrl() {
    if (typeof window !== 'undefined') return window.location.origin;
    // eslint-disable-next-line no-restricted-properties
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    // eslint-disable-next-line no-restricted-properties
    return `http://localhost:${process.env.PORT ?? 3000}`;
}
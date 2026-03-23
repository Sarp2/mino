'use client';

import { createTRPCClient } from '@trpc/client';

import { type AppRouter } from '@/server/api/root';
import { links } from './helpers';

/* Vanilla tRPC client for use outside React components (e.g. MobX stores, classes) */
export const vanillaApi = createTRPCClient<AppRouter>({ links });

import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/env';

/**
 * Creates a Supabase browser client using the application's public URL and publishable key from environment.
 *
 * Uses env.NEXT_PUBLIC_SUPABASE_URL and env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to configure the client.
 *
 * @returns A Supabase browser client instance configured with the public URL and publishable key.
 */
export function createClient() {
    return createBrowserClient(
        /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}
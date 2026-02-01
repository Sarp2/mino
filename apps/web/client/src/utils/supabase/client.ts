import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/env';

export function createClient() {
    return createBrowserClient(
        /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}

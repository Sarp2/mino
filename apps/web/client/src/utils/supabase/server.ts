import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { env } from '@/env';

/**
 * Create a Supabase server-side (SSR) client configured to use the Next.js cookie store for auth and session handling.
 *
 * The returned client delegates cookie reads to the current Next.js cookie store and attempts to apply cookie writes
 * back to that store; cookie write failures are caught and ignored (useful when called from Server Components).
 *
 * @returns A Supabase SSR client configured with the app's public URL and publishable key and wired to the Next.js cookies API
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        },
    );
}
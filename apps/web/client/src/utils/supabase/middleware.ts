import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { NextRequest } from 'next/server';

import { env } from '@/env';

/**
 * Synchronizes Supabase auth session cookies between the incoming Next.js request and the outgoing response.
 *
 * @param request - The incoming Next.js request whose cookies will be read and updated to reflect refreshed Supabase auth tokens.
 * @returns The NextResponse for the client with any updated session cookies applied.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // update the incoming request
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    // re-new the request
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    // set the cookies on the response with full options
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );
    // refresh the tokens
    await supabase.auth.getUser();
    return supabaseResponse;
}
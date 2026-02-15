import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { api } from '@/trpc/server';
import { Routes } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';

/**
 * Handle OAuth callback by exchanging the authorization code for a Supabase session, upserting the user, and redirecting the client.
 *
 * Attempts to exchange the `code` query parameter for a session; if successful, ensures the user exists in the system and redirects to the projects page, otherwise redirects to the error page. Errors encountered during exchange or user upsert are logged.
 *
 * @returns A NextResponse that redirects to the projects page on success, or to the error page on failure.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const user = await api.user.upsert({
                id: data.user.id,
            });

            if (!user) {
                console.error(`Failed to create user for id: ${data.user.id}`, {
                    user,
                });
                return NextResponse.redirect(`${origin}${Routes.ERROR}`);
            }

            return NextResponse.redirect(`${origin}${Routes.PROJECTS}`);
        }

        console.error(`Error exchanging code for session: ${error}`);
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}${Routes.ERROR}`);
}
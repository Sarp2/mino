import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import type { SourceType } from '@/types';

import { api } from '@/trpc/server';
import { redirectToProjects } from '@/utils/auth/redirect-to-projects';
import { Routes, Source, SOURCE_SEARCH_PARAM_KEY } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    const sourceParam = searchParams.get(SOURCE_SEARCH_PARAM_KEY);
    const source: SourceType | undefined =
        sourceParam === Source.GITHUB || sourceParam === Source.TEMPLATES
            ? sourceParam
            : undefined;

    if (code) {
        const supabase = await createClient();

        const response = await supabase.auth
            .exchangeCodeForSession(code)
            .catch((err: Error) => {
                console.error(
                    'Unexpected error exchanging code for session:',
                    err.message,
                );
                return null;
            });

        if (!response || response.error) {
            console.error(
                'Error exchanging code for session:',
                response?.error?.message,
            );
            return NextResponse.redirect(`${origin}${Routes.ERROR}`);
        }

        let user;

        // Only save the githubAccessToken token if provider is github
        const githubAccessToken =
            source === Source.GITHUB
                ? (response.data.session?.provider_token ?? undefined)
                : undefined;

        try {
            user = await api.user.upsert({
                id: response.data.user.id,
                githubAccessToken,
            });
        } catch (error) {
            console.error('Failed to upsert user:', error);
            return NextResponse.redirect(`${origin}${Routes.ERROR}`);
        }

        if (!user) {
            console.error('Upsert returned null for user');
            return NextResponse.redirect(`${origin}${Routes.ERROR}`);
        }

        return NextResponse.redirect(redirectToProjects(origin, source));
    }

    return NextResponse.redirect(`${origin}${Routes.ERROR}`);
}

'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { SEED_USER } from '@mino/db';
import { SignInMethod } from '@mino/models';

import { env } from '@/env';
import { redirectToProjects } from '@/utils/auth/redirect-to-projects';
import { Routes, Source, SOURCE_SEARCH_PARAM_KEY } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';

export async function login(
    provider: SignInMethod.GITHUB | SignInMethod.GOOGLE,
) {
    const supabase = await createClient();

    const origin = (await headers()).get('origin') ?? env.NEXT_PUBLIC_SITE_URL;
    const callbackUrl = new URL(`${origin}${Routes.AUTH_CALLBACK}`);

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    // If user re-sign in up with its account using github, link auth identity
    if (user && provider === SignInMethod.GITHUB) {
        // Check if GitHub identity is already linked
    const isGithubAlreadyLinked = user.identities?.some(
        (identity) => identity.provider === 'github'
    );

    if (isGithubAlreadyLinked) {
        // Already linked — just redirect to projects
        redirect(redirectToProjects(origin, Source.PROJECTS));
    }

    // Not yet linked — proceed with linking
    callbackUrl.searchParams.set(SOURCE_SEARCH_PARAM_KEY, Source.GITHUB);
    const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: {
            redirectTo: callbackUrl.toString(),
        },
    });

    if (error || !data.url) {
        console.error(
            'Error starting GitHub identity link OAuth:',
            error?.message ?? 'No redirect URL returned',
        );
        redirect(Routes.ERROR);
    }

    redirect(data.url);
    }

    if (user) {
        redirect(redirectToProjects(origin, Source.PROJECTS));
    }

    callbackUrl.searchParams.set(
        SOURCE_SEARCH_PARAM_KEY,
        provider === SignInMethod.GITHUB ? Source.GITHUB : Source.TEMPLATES,
    );

    const redirectTo = callbackUrl.toString();

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo,
        },
    });

    if (oauthError || !data.url) {
        console.error(
            'Error signing in with OAuth:',
            oauthError?.message ?? 'No redirect URL returned',
        );
        redirect(Routes.ERROR);
    }

    redirect(data.url);
}

export async function devLogin() {
    if (env.NODE_ENV !== 'development' && env.NODE_ENV !== 'test') {
        throw new Error('Dev login is only available in development or test');
    }

    const supabase = await createClient();
    const origin = (await headers()).get('origin') ?? env.NEXT_PUBLIC_SITE_URL;

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (user) redirect(redirectToProjects(origin, Source.PROJECTS));

    const { error } = await supabase.auth.signInWithPassword({
        email: SEED_USER.EMAIL,
        password: SEED_USER.PASSWORD,
    });

    if (error) {
        console.error('Error signing in with password:', error.message);
        redirect(Routes.ERROR);
    }

    redirect(redirectToProjects(origin, Source.TEMPLATES));
}

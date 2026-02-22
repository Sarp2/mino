'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SignInMethod } from '@mino/models';

import { SEED_USER } from '@mino/db';

import { env } from '@/env';
import { Routes } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';

export async function login(
    provider: SignInMethod.GITHUB | SignInMethod.GOOGLE,
) {
    const supabase = await createClient();

    const origin = (await headers()).get('origin') ?? env.NEXT_PUBLIC_SITE_URL;
    const redirectTo = `${origin}${Routes.AUTH_CALLBACK}`;

    const {
        data: { user },
        error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
        console.error('Failed to retrieve user session:', getUserError.message);
        redirect(Routes.ERROR);
    }

    if (user) {
        redirect(Routes.PROJECTS);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo,
        },
    });

    if (error) {
        console.error('Error signing in with OAuth:', error.message);
        redirect(Routes.ERROR);
    }

    redirect(data.url);
}

export async function devLogin() {
    if (env.NODE_ENV !== 'development') {
        throw new Error('Dev login is only available in development mode');
    }

    const supabase = await createClient();

    const {
        data: { user },
        error: getUserError,
    } = await supabase.auth.getUser();

    if (getUserError) {
        console.error('Failed to retrieve user session:', getUserError.message);
        redirect(Routes.ERROR);
    }

    if (user) {
        redirect(Routes.PROJECTS);
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: SEED_USER.EMAIL,
        password: SEED_USER.PASSWORD,
    });

    if (error) {
        console.error('Error signing in with password:', error.message);
        redirect(Routes.ERROR);
    }

    redirect(Routes.PROJECTS);
}

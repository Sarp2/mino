import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { api } from '@/trpc/server';
import { Routes } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

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

        try {
            user = await api.user.upsert({ id: response.data.user.id });
        } catch (error) {
            console.error('Failed to upsert user:', error);
            return NextResponse.redirect(`${origin}${Routes.ERROR}`);
        }

        if (!user) {
            console.error('Upsert returned null for user');
            return NextResponse.redirect(`${origin}${Routes.ERROR}`);
        }

        return NextResponse.redirect(`${origin}${Routes.PROJECTS}`);
    }

    return NextResponse.redirect(`${origin}${Routes.ERROR}`);
}

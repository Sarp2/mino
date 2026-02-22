import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import type { NextRequest } from 'next/server';

import { env } from '@/env';
import { Routes } from '../constants';

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

    const { data, error } = await supabase.auth.getUser();
    const user = data.user;

    const pathname = request.nextUrl.pathname;
    const isPublic =
        pathname === Routes.LOGIN ||
        pathname === Routes.HOME ||
        pathname === Routes.AUTH_CALLBACK ||
        pathname === Routes.ERROR;

    // If Supabase had an error, only block access to protected routes
    // to avoid wrongly redirecting users during a temporary auth hiccup
    if (error && !isPublic) {
        console.error('Supabase auth error:', error.message);

        const url = request.nextUrl.clone();
        url.pathname = Routes.ERROR;

        return NextResponse.redirect(url);
    }

    // Logged-in user trying to visit login page, send to /projects
    if (user && pathname === Routes.LOGIN) {
        const url = request.nextUrl.clone();
        url.pathname = Routes.PROJECTS;

        return NextResponse.redirect(url);
    }

    // Not logged-in user trying to access procted route, send to /login
    if (!user && !isPublic) {
        const url = request.nextUrl.clone();
        url.pathname = Routes.LOGIN;

        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

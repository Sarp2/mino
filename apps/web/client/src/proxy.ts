import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { Routes } from './utils/constants';
import { updateSession } from './utils/supabase/middleware';

export async function proxy(request: NextRequest) {
    // Refresh session and get current user state
    const { response, user, error } = await updateSession(request);

    const pathname = request.nextUrl.pathname;
    const isPublic =
        pathname === Routes.LOGIN ||
        pathname === Routes.HOME ||
        pathname === Routes.AUTH_CALLBACK ||
        pathname === Routes.ERROR;

    if (error && !isPublic) {
        const url = request.nextUrl.clone();

        // "AuthSessionMissingError" just means the user isn't logged in —
        // send them to login instead of the error page
        if (error.name === 'AuthSessionMissingError') {
            url.pathname = Routes.LOGIN;
        } else {
            // A real Supabase error (network issue, misconfiguration, etc.)
            console.error('Supabase auth error:', error.message);
            url.pathname = Routes.ERROR;
        }

        return NextResponse.redirect(url);
    }

    // Prevent logged-in users from accessing the login page
    if (user && pathname === Routes.LOGIN) {
        const url = request.nextUrl.clone();
        url.pathname = Routes.PROJECTS;

        return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users away from protected routes
    if (!user && !isPublic) {
        const url = request.nextUrl.clone();
        url.pathname = Routes.LOGIN;

        return NextResponse.redirect(url);
    }

    // Pass through with the refreshed session cookies
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

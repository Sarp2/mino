import { type NextRequest } from 'next/server';

import { updateSession } from './utils/supabase/middleware';

/**
 * Refreshes the authentication session based on the incoming Next.js request.
 *
 * @param request - Incoming Next.js request used to update the user's session.
 * @returns The result of the session update operation.
 */
export async function proxy(request: NextRequest) {
    // update thew user's auth session
    return await updateSession(request);
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
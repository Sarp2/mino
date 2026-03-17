import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isTestEnv = process.env.NODE_ENV === 'test';

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        NODE_ENV: z.enum(['development', 'test', 'production']),
        SUPABASE_DATABASE_URL: z.string().url(),
        SUPABASE_SERVICE_ROLE_KEY: z.string(),

        GITHUB_APP_ID: z.string(),
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_APP_PRIVATE_KEY: z.string(),
        CSB_API_KEY: z.string(),

        TEST_SUPABASE_DATABASE_URL: z.string(),
        TEST_SUPABASE_SERVICE_ROLE_KEY: z.string(),
    },

    /**
     * Specify your client-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars. To expose them to the client, prefix them with
     * `NEXT_PUBLIC_`.
     */
    client: {
        // NEXT_PUBLIC_CLIENTVAR: z.string(),
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string(),
        NEXT_PUBLIC_SITE_URL: z.string().url(),
        NEXT_PUBLIC_TEST_SUPABASE_URL: z.string(),
        NEXT_PUBLIC_TEST_SUPABASE_PUBLISHABLE_KEY: z.string(),
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        
        GITHUB_APP_ID: process.env.GITHUB_APP_ID,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,
        
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        
        SUPABASE_DATABASE_URL: process.env.SUPABASE_DATABASE_URL,

        CSB_API_KEY: isTestEnv
        ? process.env.TEST_CSB_API_KEY
        : process.env.CSB_API_KEY,

        // Playwright
        NEXT_PUBLIC_TEST_SUPABASE_URL: process.env.NEXT_PUBLIC_TEST_SUPABASE_URL,
        NEXT_PUBLIC_TEST_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_TEST_SUPABASE_PUBLISHABLE_KEY,
        TEST_SUPABASE_SERVICE_ROLE_KEY: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY,
        TEST_SUPABASE_DATABASE_URL: process.env.TEST_SUPABASE_DATABASE_URL,

    },
    /**
     * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
     * useful for Docker builds.
     */
    skipValidation: true,
    /**
     * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
     * `SOME_VAR=''` will throw an error.
     */
    emptyStringAsUndefined: true,
});

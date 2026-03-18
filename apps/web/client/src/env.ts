import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isTestEnv = process.env.MINO_ENV === 'test';

export const env = createEnv({
    /**
     * Specify your server-side environment variables schema here. This way you can ensure the app
     * isn't built with invalid env vars.
     */
    server: {
        MINO_ENV: z.enum(['development', 'test', 'production']).optional(),
        NODE_ENV: z.enum(['development', 'test', 'production']),
        SUPABASE_DATABASE_URL: z.string().url(),
        SUPABASE_SERVICE_ROLE_KEY: z.string(),

        GITHUB_APP_ID: z.string(),
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_APP_PRIVATE_KEY: z.string(),
        
        CSB_API_KEY: z.string(),
        ENCRYPTION_KEY: z.string(),
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
    },

    /**
     * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
     * middlewares) or client-side so we need to destruct manually.
     */
    runtimeEnv: {
        MINO_ENV: process.env.MINO_ENV,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,

        GITHUB_APP_ID: process.env.GITHUB_APP_ID,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY,

        NEXT_PUBLIC_SUPABASE_URL: isTestEnv === true 
        ? process.env.NEXT_PUBLIC_TEST_SUPABASE_URL 
        : process.env.NEXT_PUBLIC_SUPABASE_URL,
        
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: isTestEnv === true 
        ? process.env.NEXT_PUBLIC_TEST_SUPABASE_PUBLISHABLE_KEY 
        : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        
        SUPABASE_SERVICE_ROLE_KEY: isTestEnv === true 
        ? process.env.TEST_SUPABASE_SERVICE_ROLE_KEY 
        : process.env.SUPABASE_SERVICE_ROLE_KEY,
        
        SUPABASE_DATABASE_URL: isTestEnv === true 
        ? process.env.TEST_SUPABASE_DATABASE_URL 
        : process.env.SUPABASE_DATABASE_URL,

        CSB_API_KEY: isTestEnv === true ? process.env.TEST_CSB_API_KEY : process.env.CSB_API_KEY,

        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? '0'.repeat(64),
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

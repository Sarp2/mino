import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/schema',
    out: '../../apps/backend/supabase/migrations',
    dialect: 'postgresql',
    verbose: true,
    dbCredentials: {
        url: process.env.SUPASBASE_DATABASE_URL!,
    },
    entities: {
        roles: {
            provider: 'supabase',
        },
    },
});

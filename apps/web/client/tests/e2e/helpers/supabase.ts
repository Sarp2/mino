import { createClient } from '@supabase/supabase-js';

import { env } from '@/env';

export const supabaseAdmin = createClient(
    env.NEXT_PUBLIC_TEST_SUPABASE_URL,
    env.TEST_SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
);

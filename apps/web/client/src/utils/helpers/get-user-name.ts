import type { User } from '@supabase/supabase-js';

import { extractNames } from '@mino/utility';

export const getUserName = (authUser: User) => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const displayName: string | undefined =
        authUser.user_metadata.name ??
        authUser.user_metadata.display_name ??
        authUser.user_metadata.full_name ??
        authUser.app_metadata.first_name ??
        authUser.app_metadata.last_name ??
        authUser.app_metadata.given_name ??
        authUser.user_metadata.family_name;

    const { firstName, lastName } = extractNames(displayName ?? '');
    return {
        displayName: displayName ?? '',
        firstName,
        lastName,
    };
};

import type {
    AuthErrorKind,
    DescriptionRule,
    SupabaseAuthErrorCode,
} from '@/types';

import { CODE_TO_KIND } from '../constants';

const DESCRIPTION_RULES: Partial<
    Record<SupabaseAuthErrorCode, DescriptionRule[]>
> = {
    identity_already_exists: [
        {
            contains: 'already linked to another user',
            kind: 'identity_linked_to_another_user',
        },
        {
            contains: 'already linked', //
            kind: 'identity_already_exists',
        },
    ],
};

export const resolveAuthErrorKind = (
    code: string | null,
    description: string | null,
): AuthErrorKind => {
    if (!code) return 'generic';

    const supabaseCode = code as SupabaseAuthErrorCode;
    const normalizedDesc = description?.toLowerCase() ?? '';

    // Check description-based rules first (more specific)
    const descRules = DESCRIPTION_RULES[supabaseCode];
    if (descRules) {
        const matched = descRules.find(({ contains }) =>
            normalizedDesc.includes(contains),
        );
        if (matched) return matched.kind;
    }

    return CODE_TO_KIND[supabaseCode] ?? 'generic';
};

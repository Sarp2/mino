import type { RouterOutputs } from './trpc/react';

export type Template = {
    id: string;
    templateId: string;
    name: string;
    description: string;
};

export type SourceType = 'projects' | 'github' | 'templates';

export type GithubRepo = RouterOutputs['github']['getRepos'][number];

export interface SandboxResult {
    sandboxId: string;
    sandboxUrl: string;
}

// ─────────────────────────────────────────────
// Supabase Auth error codes (subset — extend as needed)
// Source: https://supabase.com/docs/guides/auth/debugging/error-codes
// ─────────────────────────────────────────────

export type SupabaseAuthErrorCode =
    // Identity / linking
    | 'identity_already_exists'
    | 'identity_not_found'
    | 'manual_linking_disabled'
    | 'single_identity_not_deletable'
    | 'email_conflict_identity_not_deletable'

    // OAuth / SSO / SAML
    | 'bad_oauth_callback'
    | 'bad_oauth_state'
    | 'oauth_provider_not_supported'
    | 'provider_disabled'
    | 'saml_provider_disabled'
    | 'saml_idp_not_found'
    | 'saml_relay_state_expired'
    | 'saml_relay_state_not_found'
    | 'sso_provider_not_found'
    | 'sso_domain_already_exists'
    // Session / token
    | 'session_expired'
    | 'session_not_found'
    | 'refresh_token_not_found'
    | 'refresh_token_already_used'

    // User
    | 'user_already_exists'
    | 'user_not_found'
    | 'user_banned'
    | 'user_sso_managed'
    | 'signup_disabled'
    | 'invalid_credentials'
    | 'same_password'
    | 'weak_password'
    | 'reauthentication_needed'
    | 'reauthentication_not_valid'
    | 'invite_not_found'
    // Server / misc
    | 'request_timeout'
    | 'unexpected_failure'
    | 'bad_jwt'
    | 'no_authorization'
    | 'not_admin'
    | 'validation_failed';

// ─────────────────────────────────────────────
// Application-level error kinds
// These map one or more Supabase codes → a single UX view
// ─────────────────────────────────────────────

export type AuthErrorKind =
    // Identity / linking
    | 'identity_linked_to_another_user'
    | 'identity_already_exists'
    | 'manual_linking_disabled'

    // OAuth / SSO
    | 'oauth_error'
    | 'provider_disabled'
    | 'sso_not_found'
    // Session / token
    | 'session_expired'
    | 'token_expired'

    // User account
    | 'user_banned'
    | 'signup_disabled'

    // Rate limits / server
    | 'server_error'
    // Fallback
    | 'generic';

export interface AuthErrorView {
    eyebrow: string;
    title: string;
    description: string;
    showSupportAction?: boolean;
}

export type DescriptionRule = {
    contains: string;
    kind: AuthErrorKind;
};

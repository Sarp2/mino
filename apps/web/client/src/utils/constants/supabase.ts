import type {
    AuthErrorKind,
    AuthErrorView,
    SupabaseAuthErrorCode,
} from '@/types';

export const AUTH_ERROR_VIEWS: Record<AuthErrorKind, AuthErrorView> = {
    identity_linked_to_another_user: {
        eyebrow: 'GitHub Connection Error',
        title: 'This GitHub account belongs to another user',
        description:
            'This GitHub account is already connected to a different account. Sign out and log in with that account, or link a different GitHub profile.',
        showSupportAction: true,
    },
    identity_already_exists: {
        eyebrow: 'GitHub Connection Error',
        title: 'GitHub account already linked',
        description:
            'This GitHub account is already connected. Continue to login with GitHub.',
    },
    manual_linking_disabled: {
        eyebrow: 'Configuration Error',
        title: 'Account linking is disabled',
        description:
            'Manual identity linking is not enabled for this project. Please contact support or an admin to resolve this.',
        showSupportAction: true,
    },

    oauth_error: {
        eyebrow: 'OAuth Error',
        title: 'OAuth sign-in failed',
        description:
            'Something went wrong during the OAuth flow. This is usually a temporary issue — please try again.',
    },
    provider_disabled: {
        eyebrow: 'Provider Unavailable',
        title: 'This sign-in method is disabled',
        description:
            'The OAuth provider you are trying to use is currently disabled. Please choose another login method.',
    },
    sso_not_found: {
        eyebrow: 'SSO Error',
        title: 'SSO provider not found',
        description:
            'The SSO provider for your organization could not be found. Make sure your email domain is correctly configured, or contact your administrator.',
        showSupportAction: true,
    },

    session_expired: {
        eyebrow: 'Session Expired',
        title: 'Your session has expired',
        description:
            'Your login session is no longer valid. Please sign in again to continue.',
    },
    token_expired: {
        eyebrow: 'Token Expired',
        title: 'Your session token has expired',
        description:
            'Your refresh token is no longer valid, possibly because you signed in on another device. Please sign in again.',
    },

    user_banned: {
        eyebrow: 'Account Suspended',
        title: 'Your account has been suspended',
        description:
            'Your account is temporarily suspended. If you believe this is a mistake, please contact support.',
        showSupportAction: true,
    },
    signup_disabled: {
        eyebrow: 'Registration Closed',
        title: 'New sign-ups are currently disabled',
        description:
            'We are not accepting new accounts at this time. Please check back later or contact support.',
    },
    server_error: {
        eyebrow: 'Server Error',
        title: 'Something went wrong on our end',
        description:
            'Our authentication service is experiencing issues. Please try again in a few moments. If the problem persists, contact support.',
        showSupportAction: true,
    },

    generic: {
        eyebrow: 'Login Error',
        title: 'Something went wrong',
        description:
            'We could not complete the sign-in flow. Please try again from the login page.',
    },
};

export const CODE_TO_KIND: Partial<
    Record<SupabaseAuthErrorCode, AuthErrorKind>
> = {
    // Identity / linking
    identity_already_exists: 'identity_already_exists',
    identity_not_found: 'identity_already_exists',
    manual_linking_disabled: 'manual_linking_disabled',
    single_identity_not_deletable: 'identity_already_exists',
    email_conflict_identity_not_deletable: 'identity_already_exists',

    // OAuth / SSO
    bad_oauth_callback: 'oauth_error',
    bad_oauth_state: 'oauth_error',
    oauth_provider_not_supported: 'provider_disabled',
    provider_disabled: 'provider_disabled',
    saml_provider_disabled: 'provider_disabled',
    saml_idp_not_found: 'sso_not_found',
    saml_relay_state_expired: 'session_expired',
    saml_relay_state_not_found: 'session_expired',
    sso_provider_not_found: 'sso_not_found',

    // Session / token
    session_expired: 'session_expired',
    session_not_found: 'session_expired',
    refresh_token_not_found: 'token_expired',
    refresh_token_already_used: 'token_expired',

    // User account
    user_banned: 'user_banned',
    signup_disabled: 'signup_disabled',

    // Rate limits / server
    request_timeout: 'server_error',
    unexpected_failure: 'server_error',
};

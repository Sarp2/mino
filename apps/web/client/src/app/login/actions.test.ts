import { describe, expect, it, jest, beforeEach, mock } from 'bun:test';
import { SignInMethod } from '@mino/models';

// Mock dependencies
const mockRedirect = jest.fn();
const mockHeaders = jest.fn();
const mockCreateClient = jest.fn();

jest.mock('next/navigation', () => ({
    redirect: mockRedirect,
}));

jest.mock('next/headers', () => ({
    headers: mockHeaders,
}));

jest.mock('@/utils/supabase/server', () => ({
    createClient: mockCreateClient,
}));

jest.mock('@/env', () => ({
    env: {
        NEXT_PUBLIC_SITE_URL: 'https://example.com',
        NODE_ENV: 'development',
    },
}));

jest.mock('@mino/db', () => ({
    SEED_USER: {
        EMAIL: 'test@example.com',
        PASSWORD: 'testpassword123',
    },
}));

jest.mock('@/utils/constants', () => ({
    Routes: {
        PROJECTS: '/projects',
        AUTH_CALLBACK: '/auth/callback',
        ERROR: '/auth/error',
    },
}));

const { login, devLogin } = await import('./actions');

describe('login', () => {
    let mockSupabase: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT: ${url}`);
        });

        mockSupabase = {
            auth: {
                getSession: jest.fn(),
                signInWithOAuth: jest.fn(),
            },
        };

        mockCreateClient.mockResolvedValue(mockSupabase);
        mockHeaders.mockResolvedValue({
            get: jest.fn().mockReturnValue('https://example.com'),
        });
    });

    it('redirects to projects if user already has a session', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: '123' } } },
        });

        await expect(login(SignInMethod.GITHUB)).rejects.toThrow(
            'REDIRECT: /projects',
        );

        expect(mockSupabase.auth.signInWithOAuth).not.toHaveBeenCalled();
    });

    it('initiates OAuth flow with GitHub provider', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
            data: { url: 'https://github.com/oauth' },
            error: null,
        });

        await expect(login(SignInMethod.GITHUB)).rejects.toThrow(
            'REDIRECT: https://github.com/oauth',
        );

        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
            provider: SignInMethod.GITHUB,
            options: {
                redirectTo: 'https://example.com/auth/callback',
            },
        });
    });

    it('initiates OAuth flow with Google provider', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
            data: { url: 'https://google.com/oauth' },
            error: null,
        });

        await expect(login(SignInMethod.GOOGLE)).rejects.toThrow(
            'REDIRECT: https://google.com/oauth',
        );

        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
            provider: SignInMethod.GOOGLE,
            options: {
                redirectTo: 'https://example.com/auth/callback',
            },
        });
    });

    it('redirects to error page when OAuth sign-in fails', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
            data: null,
            error: { message: 'OAuth error' },
        });

        await expect(login(SignInMethod.GITHUB)).rejects.toThrow(
            'REDIRECT: /auth/error',
        );
    });

    it('uses origin from headers for redirectTo URL', async () => {
        mockHeaders.mockResolvedValue({
            get: jest.fn().mockReturnValue('https://custom-origin.com'),
        });
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
            data: { url: 'https://github.com/oauth' },
            error: null,
        });

        await expect(login(SignInMethod.GITHUB)).rejects.toThrow('REDIRECT:');

        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
            provider: SignInMethod.GITHUB,
            options: {
                redirectTo: 'https://custom-origin.com/auth/callback',
            },
        });
    });

    it('uses env NEXT_PUBLIC_SITE_URL when origin header is null', async () => {
        mockHeaders.mockResolvedValue({
            get: jest.fn().mockReturnValue(null),
        });
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
            data: { url: 'https://github.com/oauth' },
            error: null,
        });

        await expect(login(SignInMethod.GITHUB)).rejects.toThrow('REDIRECT:');

        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
            provider: SignInMethod.GITHUB,
            options: {
                redirectTo: 'https://example.com/auth/callback',
            },
        });
    });
});

describe('devLogin', () => {
    let mockSupabase: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRedirect.mockImplementation((url: string) => {
            throw new Error(`REDIRECT: ${url}`);
        });

        mockSupabase = {
            auth: {
                getSession: jest.fn(),
                signInWithPassword: jest.fn(),
            },
        };

        mockCreateClient.mockResolvedValue(mockSupabase);
    });

    it('throws error when not in development mode', async () => {
        // Mock NODE_ENV as production
        const mockEnv = await import('@/env');
        (mockEnv.env as any).NODE_ENV = 'production';

        await expect(devLogin()).rejects.toThrow(
            'Dev login is only available in development mode',
        );

        // Restore NODE_ENV
        (mockEnv.env as any).NODE_ENV = 'development';
    });

    it('redirects to projects if user already has a session', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: { user: { id: '123' } } },
        });

        await expect(devLogin()).rejects.toThrow('REDIRECT: /projects');

        expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('signs in with seed user credentials', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            error: null,
        });

        await expect(devLogin()).rejects.toThrow('REDIRECT: /projects');

        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'testpassword123',
        });
    });

    it('throws error when sign-in with password fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            error: { message: 'Invalid credentials' },
        });

        await expect(devLogin()).rejects.toThrow('Invalid credentials');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error signing in with password:',
            { message: 'Invalid credentials' },
        );

        consoleErrorSpy.mockRestore();
    });

    it('logs error to console when password sign-in fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            error: { message: 'Network error' },
        });

        try {
            await devLogin();
        } catch (error) {
            expect(consoleErrorSpy).toHaveBeenCalled();
        }

        consoleErrorSpy.mockRestore();
    });

    it('redirects to projects after successful dev login', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
            data: { session: null },
        });
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
            error: null,
        });

        await expect(devLogin()).rejects.toThrow('REDIRECT: /projects');

        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
    });
});
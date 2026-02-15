import { describe, expect, it, jest, beforeEach } from 'bun:test';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock dependencies
const mockCreateClient = jest.fn();
const mockApiUserUpsert = jest.fn();

jest.mock('@/utils/supabase/server', () => ({
    createClient: mockCreateClient,
}));

jest.mock('@/utils/constants', () => ({
    Routes: {
        ERROR: '/auth/error',
        PROJECTS: '/projects',
        AUTH_CALLBACK: '/auth/callback',
    },
}));

jest.mock('@/trpc/server', () => ({
    api: {
        user: {
            upsert: mockApiUserUpsert,
        },
    },
}));

const { GET } = await import('./route');

describe('auth/callback route GET handler', () => {
    let mockSupabase: any;
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSupabase = {
            auth: {
                exchangeCodeForSession: jest.fn(),
            },
        };

        mockCreateClient.mockResolvedValue(mockSupabase);

        mockRequest = {
            url: 'https://example.com/auth/callback?code=test-code',
        };
    });

    it('exchanges code for session successfully', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: 'user-123' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue({
            id: 'user-123',
            email: 'test@example.com',
        });

        const response = await GET(mockRequest as NextRequest);

        expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
            'test-code',
        );
        expect(mockApiUserUpsert).toHaveBeenCalledWith({ id: 'user-123' });
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
            'https://example.com/projects',
        );
    });

    it('redirects to error page when code is missing', async () => {
        mockRequest.url = 'https://example.com/auth/callback';

        const response = await GET(mockRequest as NextRequest);

        expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
            'https://example.com/auth/error',
        );
    });

    it('redirects to error page when exchange code fails', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: null,
            error: { message: 'Invalid code' },
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const response = await GET(mockRequest as NextRequest);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
            'https://example.com/auth/error',
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error exchanging code for session: [object Object]',
        );

        consoleErrorSpy.mockRestore();
    });

    it('redirects to error page when user upsert fails', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: 'user-123' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue(null);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        const response = await GET(mockRequest as NextRequest);

        expect(mockApiUserUpsert).toHaveBeenCalledWith({ id: 'user-123' });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to create user for id: user-123',
            { user: null },
        );
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
            'https://example.com/auth/error',
        );

        consoleErrorSpy.mockRestore();
    });

    it('logs error when exchange code returns error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const error = { message: 'Network error', code: 'network_error' };

        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: null,
            error,
        });

        await GET(mockRequest as NextRequest);

        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('handles different origin URLs correctly', async () => {
        mockRequest.url = 'https://custom-domain.com/auth/callback?code=test-code';

        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: 'user-123' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue({
            id: 'user-123',
            email: 'test@example.com',
        });

        const response = await GET(mockRequest as NextRequest);

        expect(response.headers.get('location')).toBe(
            'https://custom-domain.com/projects',
        );
    });

    it('calls createClient to get supabase instance', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: 'user-123' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue({
            id: 'user-123',
            email: 'test@example.com',
        });

        await GET(mockRequest as NextRequest);

        expect(mockCreateClient).toHaveBeenCalled();
    });

    it('redirects to projects page after successful authentication flow', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: 'user-456', email: 'user@example.com' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue({
            id: 'user-456',
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
        });

        const response = await GET(mockRequest as NextRequest);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/projects');
    });

    it('handles missing user id in exchange response', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: '' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue(null);

        const response = await GET(mockRequest as NextRequest);

        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
            'https://example.com/auth/error',
        );
    });

    it('handles query parameters correctly when code is present', async () => {
        mockRequest.url =
            'https://example.com/auth/callback?code=abc123&state=xyz&other=param';

        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
            data: {
                user: { id: 'user-123' },
            },
            error: null,
        });

        mockApiUserUpsert.mockResolvedValue({
            id: 'user-123',
        });

        await GET(mockRequest as NextRequest);

        expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
            'abc123',
        );
    });
});
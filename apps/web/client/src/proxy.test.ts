import { describe, expect, it, jest, beforeEach } from 'bun:test';
import type { NextRequest } from 'next/server';

// Mock dependencies
const mockUpdateSession = jest.fn();

jest.mock('./utils/supabase/middleware', () => ({
    updateSession: mockUpdateSession,
}));

const { proxy, config } = await import('./proxy');

describe('proxy middleware', () => {
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            url: 'https://example.com/some-path',
            nextUrl: {
                pathname: '/some-path',
            } as any,
        };
    });

    it('calls updateSession with the request', async () => {
        const mockResponse = { status: 200 };
        mockUpdateSession.mockResolvedValue(mockResponse);

        const result = await proxy(mockRequest as NextRequest);

        expect(mockUpdateSession).toHaveBeenCalledWith(mockRequest);
        expect(result).toBe(mockResponse);
    });

    it('returns the response from updateSession', async () => {
        const expectedResponse = {
            status: 200,
            headers: new Map([['content-type', 'application/json']]),
        };
        mockUpdateSession.mockResolvedValue(expectedResponse);

        const result = await proxy(mockRequest as NextRequest);

        expect(result).toEqual(expectedResponse);
    });

    it('handles updateSession errors', async () => {
        const error = new Error('Session update failed');
        mockUpdateSession.mockRejectedValue(error);

        await expect(proxy(mockRequest as NextRequest)).rejects.toThrow(
            'Session update failed',
        );
    });

    it('awaits updateSession before returning', async () => {
        let resolved = false;
        mockUpdateSession.mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            resolved = true;
            return { status: 200 };
        });

        await proxy(mockRequest as NextRequest);

        expect(resolved).toBe(true);
    });
});

describe('proxy config', () => {
    it('exports a config object', () => {
        expect(config).toBeDefined();
        expect(typeof config).toBe('object');
    });

    it('has a matcher array', () => {
        expect(config.matcher).toBeDefined();
        expect(Array.isArray(config.matcher)).toBe(true);
    });

    it('excludes _next/static paths', () => {
        const matcher = config.matcher[0];
        expect(matcher).toContain('_next/static');
    });

    it('excludes _next/image paths', () => {
        const matcher = config.matcher[0];
        expect(matcher).toContain('_next/image');
    });

    it('excludes favicon.ico', () => {
        const matcher = config.matcher[0];
        expect(matcher).toContain('favicon.ico');
    });

    it('excludes common image extensions', () => {
        const matcher = config.matcher[0];
        expect(matcher).toContain('svg');
        expect(matcher).toContain('png');
        expect(matcher).toContain('jpg');
        expect(matcher).toContain('jpeg');
        expect(matcher).toContain('gif');
        expect(matcher).toContain('webp');
    });

    it('matcher is a regex pattern string', () => {
        const matcher = config.matcher[0];
        expect(typeof matcher).toBe('string');
        expect(matcher).toContain('(?!');
    });

    it('uses negative lookahead in matcher pattern', () => {
        const matcher = config.matcher[0];
        // Should exclude certain paths using negative lookahead
        expect(matcher.startsWith('/')).toBe(true);
        expect(matcher).toContain('(?!');
    });
});

describe('proxy middleware integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('processes valid request paths', async () => {
        const validPaths = [
            '/api/users',
            '/dashboard',
            '/auth/callback',
            '/projects/123',
        ];

        for (const path of validPaths) {
            const request = {
                url: `https://example.com${path}`,
                nextUrl: { pathname: path } as any,
            } as NextRequest;

            mockUpdateSession.mockResolvedValue({ status: 200 });

            await proxy(request);

            expect(mockUpdateSession).toHaveBeenCalledWith(request);
        }
    });

    it('maintains request integrity', async () => {
        const request = {
            url: 'https://example.com/test',
            nextUrl: { pathname: '/test' } as any,
            headers: new Headers({ authorization: 'Bearer token' }),
            cookies: {
                get: jest.fn(),
                getAll: jest.fn(),
            },
        } as any;

        mockUpdateSession.mockResolvedValue({ status: 200 });

        await proxy(request);

        expect(mockUpdateSession).toHaveBeenCalledWith(request);
    });

    it('handles root path', async () => {
        const request = {
            url: 'https://example.com/',
            nextUrl: { pathname: '/' } as any,
        } as NextRequest;

        mockUpdateSession.mockResolvedValue({ status: 200 });

        await proxy(request);

        expect(mockUpdateSession).toHaveBeenCalledWith(request);
    });

    it('handles nested paths', async () => {
        const request = {
            url: 'https://example.com/api/v1/users/123/posts',
            nextUrl: { pathname: '/api/v1/users/123/posts' } as any,
        } as NextRequest;

        mockUpdateSession.mockResolvedValue({ status: 200 });

        await proxy(request);

        expect(mockUpdateSession).toHaveBeenCalledWith(request);
    });

    it('passes through query parameters', async () => {
        const request = {
            url: 'https://example.com/search?q=test&page=1',
            nextUrl: { pathname: '/search' } as any,
        } as NextRequest;

        mockUpdateSession.mockResolvedValue({ status: 200 });

        await proxy(request);

        expect(mockUpdateSession).toHaveBeenCalledWith(request);
        expect((mockUpdateSession.mock.calls[0][0] as any).url).toContain('q=test');
    });
});
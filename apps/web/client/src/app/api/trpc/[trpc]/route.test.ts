import { describe, expect, it, jest, beforeEach } from 'bun:test';
import type { NextRequest } from 'next/server';

// Mock dependencies
const mockFetchRequestHandler = jest.fn();
const mockAppRouter = { _def: { procedures: {} } };
const mockCreateTRPCContext = jest.fn();

jest.mock('@trpc/server/adapters/fetch', () => ({
    fetchRequestHandler: mockFetchRequestHandler,
}));

jest.mock('~/server/api/root', () => ({
    appRouter: mockAppRouter,
}));

jest.mock('~/server/api/trpc', () => ({
    createTRPCContext: mockCreateTRPCContext,
}));

jest.mock('~/env', () => ({
    env: {
        NODE_ENV: 'development',
    },
}));

describe('tRPC route handler', () => {
    let mockRequest: Partial<NextRequest>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockRequest = {
            url: 'https://example.com/api/trpc/user.upsert',
            headers: new Headers(),
            method: 'POST',
        };

        mockFetchRequestHandler.mockResolvedValue(
            new Response(JSON.stringify({ result: 'success' }), {
                status: 200,
            }),
        );
    });

    it('exports GET handler', async () => {
        const { GET } = await import('./route');

        expect(GET).toBeDefined();
        expect(typeof GET).toBe('function');
    });

    it('exports POST handler', async () => {
        const { POST } = await import('./route');

        expect(POST).toBeDefined();
        expect(typeof POST).toBe('function');
    });

    it('GET and POST handlers are the same function', async () => {
        const { GET, POST } = await import('./route');

        expect(GET).toBe(POST);
    });

    it('calls fetchRequestHandler with correct endpoint', async () => {
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        expect(mockFetchRequestHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                endpoint: '/api/trpc',
            }),
        );
    });

    it('passes request to fetchRequestHandler', async () => {
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        expect(mockFetchRequestHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                req: mockRequest,
            }),
        );
    });

    it('uses appRouter from root', async () => {
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        expect(mockFetchRequestHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                router: mockAppRouter,
            }),
        );
    });

    it('provides createContext function', async () => {
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        expect(typeof call.createContext).toBe('function');
    });

    it('createContext calls createTRPCContext with request headers', async () => {
        const { GET } = await import('./route');
        const headers = new Headers({ authorization: 'Bearer token' });
        mockRequest.headers = headers;

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        await call.createContext();

        expect(mockCreateTRPCContext).toHaveBeenCalledWith(
            expect.objectContaining({
                headers,
            }),
        );
    });

    it('includes onError handler in development mode', async () => {
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        expect(call.onError).toBeDefined();
        expect(typeof call.onError).toBe('function');
    });

    it('onError logs errors in development mode', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        const mockError = {
            path: 'user.upsert',
            error: { message: 'Test error' },
        };

        call.onError(mockError);

        expect(consoleSpy).toHaveBeenCalledWith(
            '❌ tRPC failed on user.upsert: Test error',
        );

        consoleSpy.mockRestore();
    });

    it('onError handles missing path', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        const mockError = {
            path: undefined,
            error: { message: 'Test error' },
        };

        call.onError(mockError);

        expect(consoleSpy).toHaveBeenCalledWith(
            '❌ tRPC failed on <no-path>: Test error',
        );

        consoleSpy.mockRestore();
    });

    it('onError is undefined in production mode', async () => {
        // Mock production environment
        jest.resetModules();
        jest.mock('~/env', () => ({
            env: {
                NODE_ENV: 'production',
            },
        }));

        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        expect(call.onError).toBeUndefined();
    });

    it('returns response from fetchRequestHandler', async () => {
        const expectedResponse = new Response(
            JSON.stringify({ data: 'test' }),
            {
                status: 200,
                headers: { 'content-type': 'application/json' },
            },
        );

        mockFetchRequestHandler.mockResolvedValue(expectedResponse);

        const { GET } = await import('./route');
        const response = await GET(mockRequest as NextRequest);

        expect(response).toBe(expectedResponse);
    });

    it('handles POST requests', async () => {
        const postRequest = {
            ...mockRequest,
            method: 'POST',
            body: JSON.stringify({ id: 'user-123' }),
        };

        const { POST } = await import('./route');

        await POST(postRequest as NextRequest);

        expect(mockFetchRequestHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                req: postRequest,
            }),
        );
    });

    it('handles GET requests for queries', async () => {
        const getRequest = {
            ...mockRequest,
            method: 'GET',
            url: 'https://example.com/api/trpc/user.get?input=%7B%22id%22%3A%22123%22%7D',
        };

        const { GET } = await import('./route');

        await GET(getRequest as NextRequest);

        expect(mockFetchRequestHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                req: getRequest,
            }),
        );
    });

    it('creates new context for each request', async () => {
        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);
        await GET(mockRequest as NextRequest);

        expect(mockFetchRequestHandler).toHaveBeenCalledTimes(2);
    });

    it('preserves request headers when creating context', async () => {
        const customHeaders = new Headers({
            authorization: 'Bearer token-123',
            'x-custom-header': 'custom-value',
        });

        mockRequest.headers = customHeaders;

        const { GET } = await import('./route');

        await GET(mockRequest as NextRequest);

        const call = mockFetchRequestHandler.mock.calls[0][0];
        await call.createContext();

        expect(mockCreateTRPCContext).toHaveBeenCalledWith({
            headers: customHeaders,
        });
    });
});

describe('handler configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('configures handler with all required options', async () => {
        const { GET } = await import('./route');
        const mockRequest = {
            url: 'https://example.com/api/trpc/test',
            headers: new Headers(),
        } as NextRequest;

        await GET(mockRequest);

        const config = mockFetchRequestHandler.mock.calls[0][0];

        expect(config).toHaveProperty('endpoint');
        expect(config).toHaveProperty('req');
        expect(config).toHaveProperty('router');
        expect(config).toHaveProperty('createContext');
    });

    it('endpoint is set to /api/trpc', async () => {
        const { GET } = await import('./route');
        const mockRequest = {
            url: 'https://example.com/api/trpc/test',
            headers: new Headers(),
        } as NextRequest;

        await GET(mockRequest);

        const config = mockFetchRequestHandler.mock.calls[0][0];
        expect(config.endpoint).toBe('/api/trpc');
    });
});

describe('error handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('propagates errors from fetchRequestHandler', async () => {
        const error = new Error('Request handler failed');
        mockFetchRequestHandler.mockRejectedValue(error);

        const { GET } = await import('./route');
        const mockRequest = {
            url: 'https://example.com/api/trpc/test',
            headers: new Headers(),
        } as NextRequest;

        await expect(GET(mockRequest)).rejects.toThrow('Request handler failed');
    });

    it('propagates errors from createContext', async () => {
        const error = new Error('Context creation failed');
        mockCreateTRPCContext.mockRejectedValue(error);

        const { GET } = await import('./route');
        const mockRequest = {
            url: 'https://example.com/api/trpc/test',
            headers: new Headers(),
        } as NextRequest;

        await GET(mockRequest);

        const config = mockFetchRequestHandler.mock.calls[0][0];
        await expect(config.createContext()).rejects.toThrow(
            'Context creation failed',
        );
    });
});
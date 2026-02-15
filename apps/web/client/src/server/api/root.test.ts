import { describe, expect, it, jest, beforeEach } from 'bun:test';

// Mock dependencies
const mockCreateTRPCRouter = jest.fn((routers) => routers);
const mockCreateCallerFactory = jest.fn((router) => router);
const mockUserRouter = { upsert: jest.fn() };

jest.mock('~/server/api/trpc', () => ({
    createCallerFactory: mockCreateCallerFactory,
    createTRPCRouter: mockCreateTRPCRouter,
}));

jest.mock('./routers/user/user', () => ({
    userRouter: mockUserRouter,
}));

describe('appRouter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('creates router with createTRPCRouter', async () => {
        const { appRouter } = await import('./root');

        expect(mockCreateTRPCRouter).toHaveBeenCalled();
    });

    it('includes user router', async () => {
        const { appRouter } = await import('./root');

        expect(appRouter.user).toBeDefined();
        expect(appRouter.user).toBe(mockUserRouter);
    });

    it('exports AppRouter type', async () => {
        const module = await import('./root');

        expect(module.appRouter).toBeDefined();
        expect(typeof module.appRouter).toBe('object');
    });

    it('creates caller factory with appRouter', async () => {
        const { createCaller } = await import('./root');

        expect(mockCreateCallerFactory).toHaveBeenCalled();
        expect(createCaller).toBeDefined();
    });

    it('router has expected structure', async () => {
        const { appRouter } = await import('./root');

        expect(typeof appRouter).toBe('object');
        expect(appRouter.user).toBeDefined();
    });

    it('createCaller is a function or callable', async () => {
        const { createCaller } = await import('./root');

        expect(createCaller).toBeDefined();
        // createCaller should be the result of createCallerFactory
        expect(mockCreateCallerFactory).toHaveBeenCalled();
    });
});

describe('appRouter structure', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('has user property matching userRouter', async () => {
        const { appRouter } = await import('./root');

        expect(appRouter).toHaveProperty('user');
        expect(appRouter.user).toEqual(mockUserRouter);
    });

    it('passes correct router configuration to createTRPCRouter', async () => {
        await import('./root');

        expect(mockCreateTRPCRouter).toHaveBeenCalledWith({
            user: mockUserRouter,
        });
    });

    it('createCaller receives appRouter', async () => {
        const { appRouter } = await import('./root');

        expect(mockCreateCallerFactory).toHaveBeenCalledWith(appRouter);
    });
});

describe('appRouter exports', () => {
    it('exports appRouter as named export', async () => {
        const module = await import('./root');

        expect(module).toHaveProperty('appRouter');
        expect(module.appRouter).toBeDefined();
    });

    it('exports createCaller as named export', async () => {
        const module = await import('./root');

        expect(module).toHaveProperty('createCaller');
        expect(module.createCaller).toBeDefined();
    });

    it('exports AppRouter type', async () => {
        // Type exports can't be tested at runtime, but we can verify the module structure
        const module = await import('./root');

        expect(module.appRouter).toBeDefined();
        // AppRouter is a type export, so it won't exist at runtime
    });
});

describe('router initialization', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('initializes router only once per import', async () => {
        // First import
        await import('./root');
        const firstCallCount = mockCreateTRPCRouter.mock.calls.length;

        // Re-import (should use cached module)
        await import('./root');
        const secondCallCount = mockCreateTRPCRouter.mock.calls.length;

        // Should be the same because module is cached
        expect(firstCallCount).toBe(secondCallCount);
    });

    it('user router is included in router config', async () => {
        await import('./root');

        const routerConfig = mockCreateTRPCRouter.mock.calls[0][0];
        expect(routerConfig).toHaveProperty('user');
    });

    it('createCallerFactory is called with correct router', async () => {
        const { appRouter } = await import('./root');

        expect(mockCreateCallerFactory).toHaveBeenCalledTimes(1);
        expect(mockCreateCallerFactory).toHaveBeenCalledWith(appRouter);
    });
});

describe('router extensibility', () => {
    it('router structure allows for additional routers', async () => {
        const { appRouter } = await import('./root');

        // Verify router accepts the user router
        expect(appRouter.user).toBe(mockUserRouter);

        // Structure should support adding more routers in the future
        expect(typeof appRouter).toBe('object');
    });

    it('createTRPCRouter receives router definitions', async () => {
        await import('./root');

        expect(mockCreateTRPCRouter).toHaveBeenCalledWith(
            expect.objectContaining({
                user: mockUserRouter,
            }),
        );
    });
});

describe('createCaller factory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('exports createCaller function', async () => {
        const { createCaller } = await import('./root');

        expect(createCaller).toBeDefined();
    });

    it('createCaller is result of createCallerFactory', async () => {
        mockCreateCallerFactory.mockReturnValue('mockCaller');

        const { createCaller } = await import('./root');

        expect(createCaller).toBe('mockCaller');
    });

    it('createCallerFactory receives appRouter as argument', async () => {
        const { appRouter } = await import('./root');

        const factoryCall = mockCreateCallerFactory.mock.calls[0];
        expect(factoryCall[0]).toBe(appRouter);
    });
});
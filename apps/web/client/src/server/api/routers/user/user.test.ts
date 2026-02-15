import { describe, expect, it, jest, beforeEach } from 'bun:test';

// Mock dependencies
const mockCreateTRPCRouter = jest.fn((procedures) => ({ _procedures: procedures }));
const mockProctedProcedure = {
    input: jest.fn().mockReturnThis(),
    mutation: jest.fn(),
};

const mockUserInsertSchema = {
    parse: jest.fn((data) => data),
};

const mockUsers = {
    id: 'id',
};

const mockExtractNames = jest.fn((name: string) => {
    if (!name) return { firstName: '', lastName: '' };
    const parts = name.split(' ');
    return {
        firstName: parts[0] || '',
        lastName: parts[1] || '',
    };
});

jest.mock('../../trpc', () => ({
    createTRPCRouter: mockCreateTRPCRouter,
    proctedProcedure: mockProctedProcedure,
}));

jest.mock('@mino/db', () => ({
    userInsertSchema: mockUserInsertSchema,
    users: mockUsers,
}));

jest.mock('@mino/utility', () => ({
    extractNames: mockExtractNames,
}));

describe('userRouter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates router with createTRPCRouter', async () => {
        await import('./user');

        expect(mockCreateTRPCRouter).toHaveBeenCalled();
    });

    it('has upsert procedure', async () => {
        const { userRouter } = await import('./user');

        expect(userRouter._procedures).toHaveProperty('upsert');
    });

    it('upsert uses protected procedure', async () => {
        await import('./user');

        expect(mockProctedProcedure.input).toHaveBeenCalled();
        expect(mockProctedProcedure.mutation).toHaveBeenCalled();
    });

    it('upsert accepts userInsertSchema input', async () => {
        await import('./user');

        expect(mockProctedProcedure.input).toHaveBeenCalledWith(
            mockUserInsertSchema,
        );
    });
});

describe('upsert mutation', () => {
    let mockDb: any;
    let mockCtx: any;
    let upsertHandler: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            onConflictDoUpdate: jest.fn().mockReturnThis(),
            returning: jest.fn(),
        };

        mockCtx = {
            db: mockDb,
            user: {
                id: 'auth-user-123',
                email: 'test@example.com',
                user_metadata: {
                    name: 'Test User',
                    avatar_url: 'https://example.com/avatar.jpg',
                },
                app_metadata: {},
            },
        };

        mockProctedProcedure.mutation.mockImplementation((handler) => {
            upsertHandler = handler;
            return handler;
        });
    });

    it('inserts user with provided data', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([
            {
                id: 'user-123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            },
        ]);

        const result = await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(mockDb.insert).toHaveBeenCalledWith(mockUsers);
        expect(result).toEqual({
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
        });
    });

    it('extracts firstName and lastName from auth user metadata', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([{ id: 'user-123' }]);

        await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(mockExtractNames).toHaveBeenCalledWith('Test User');
    });

    it('uses input values when provided', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([{ id: 'user-123' }]);

        await upsertHandler({
            ctx: mockCtx,
            input: {
                id: 'user-123',
                firstName: 'Custom',
                lastName: 'Name',
                email: 'custom@example.com',
            },
        });

        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'Custom',
                lastName: 'Name',
                email: 'custom@example.com',
            }),
        );
    });

    it('falls back to auth user email when input email not provided', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([{ id: 'user-123' }]);

        await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'test@example.com',
            }),
        );
    });

    it('uses avatar URL from auth user metadata', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([{ id: 'user-123' }]);

        await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                avatarUrl: 'https://example.com/avatar.jpg',
            }),
        );
    });

    it('updates user on conflict', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([{ id: 'user-123' }]);

        await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(mockDb.onConflictDoUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                target: [mockUsers.id],
                set: expect.objectContaining({
                    id: 'user-123',
                    updatedAt: expect.any(Date),
                }),
            }),
        );
    });

    it('returns null when no user is returned from database', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([]);

        const result = await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(result).toBeNull();
    });

    it('returns user when database insert succeeds', async () => {
        await import('./user');

        const expectedUser = {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
        };

        mockDb.returning.mockResolvedValue([expectedUser]);

        const result = await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });

        expect(result).toEqual(expectedUser);
    });

    it('sets updatedAt on conflict update', async () => {
        await import('./user');

        mockDb.returning.mockResolvedValue([{ id: 'user-123' }]);

        const beforeUpdate = new Date();
        await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123' },
        });
        const afterUpdate = new Date();

        const updateCall = mockDb.onConflictDoUpdate.mock.calls[0][0];
        const updatedAt = updateCall.set.updatedAt;

        expect(updatedAt).toBeInstanceOf(Date);
        expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
            beforeUpdate.getTime(),
        );
        expect(updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });
});

describe('getUserName helper function', () => {
    let mockCtx: any;
    let upsertHandler: any;
    let mockDb: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            onConflictDoUpdate: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([{ id: 'user-123' }]),
        };

        mockProctedProcedure.mutation.mockImplementation((handler) => {
            upsertHandler = handler;
            return handler;
        });
    });

    it('extracts name from user_metadata.name', async () => {
        await import('./user');

        mockCtx = {
            db: mockDb,
            user: {
                id: 'user-123',
                email: 'test@example.com',
                user_metadata: { name: 'John Doe' },
                app_metadata: {},
            },
        };

        await upsertHandler({ ctx: mockCtx, input: { id: 'user-123' } });

        expect(mockExtractNames).toHaveBeenCalledWith('John Doe');
    });

    it('falls back to display_name when name is not available', async () => {
        await import('./user');

        mockCtx = {
            db: mockDb,
            user: {
                id: 'user-123',
                email: 'test@example.com',
                user_metadata: { display_name: 'Display Name' },
                app_metadata: {},
            },
        };

        await upsertHandler({ ctx: mockCtx, input: { id: 'user-123' } });

        expect(mockExtractNames).toHaveBeenCalledWith('Display Name');
    });

    it('handles empty user metadata gracefully', async () => {
        await import('./user');

        mockCtx = {
            db: mockDb,
            user: {
                id: 'user-123',
                email: 'test@example.com',
                user_metadata: {},
                app_metadata: {},
            },
        };

        await upsertHandler({ ctx: mockCtx, input: { id: 'user-123' } });

        expect(mockExtractNames).toHaveBeenCalledWith('');
    });

    it('uses provided displayName from input', async () => {
        await import('./user');

        mockCtx = {
            db: mockDb,
            user: {
                id: 'user-123',
                email: 'test@example.com',
                user_metadata: { name: 'Auth Name' },
                app_metadata: {},
            },
        };

        await upsertHandler({
            ctx: mockCtx,
            input: { id: 'user-123', displayName: 'Custom Display' },
        });

        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                displayName: 'Custom Display',
            }),
        );
    });

    it('extracts names and sets displayName when not in input', async () => {
        await import('./user');

        mockExtractNames.mockReturnValue({
            firstName: 'John',
            lastName: 'Doe',
        });

        mockCtx = {
            db: mockDb,
            user: {
                id: 'user-123',
                email: 'test@example.com',
                user_metadata: { name: 'John Doe' },
                app_metadata: {},
            },
        };

        await upsertHandler({ ctx: mockCtx, input: { id: 'user-123' } });

        expect(mockDb.values).toHaveBeenCalledWith(
            expect.objectContaining({
                displayName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
            }),
        );
    });
});
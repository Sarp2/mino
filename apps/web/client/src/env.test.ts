import { describe, expect, it, beforeEach, jest } from 'bun:test';

describe('env validation', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('validates required server environment variables', async () => {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        const { env } = await import('./env');

        expect(env.NODE_ENV).toBe('development');
        expect(env.SUPABASE_DATABASE_URL).toBe(
            'postgresql://localhost:5432/db',
        );
    });

    it('validates required client environment variables', async () => {
        process.env.NODE_ENV = 'test';
        process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        const { env } = await import('./env');

        expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(
            'https://supabase.example.com',
        );
        expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe('test-key');
        expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://example.com');
    });

    it('accepts valid NODE_ENV values', async () => {
        const validEnvs = ['development', 'test', 'production'];

        for (const nodeEnv of validEnvs) {
            process.env.NODE_ENV = nodeEnv;
            process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
            process.env.NEXT_PUBLIC_SUPABASE_URL =
                'https://supabase.example.com';
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
            process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

            jest.resetModules();
            const { env } = await import('./env');

            expect(env.NODE_ENV).toBe(nodeEnv);
        }
    });

    it('throws error for invalid NODE_ENV', async () => {
        process.env.NODE_ENV = 'invalid';
        process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        expect(async () => {
            jest.resetModules();
            await import('./env');
        }).toThrow();
    });

    it('throws error when SUPABASE_DATABASE_URL is missing', async () => {
        process.env.NODE_ENV = 'development';
        delete process.env.SUPABASE_DATABASE_URL;
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        expect(async () => {
            jest.resetModules();
            await import('./env');
        }).toThrow();
    });

    it('throws error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        expect(async () => {
            jest.resetModules();
            await import('./env');
        }).toThrow();
    });

    it('throws error when NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing', async () => {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        expect(async () => {
            jest.resetModules();
            await import('./env');
        }).toThrow();
    });

    it('throws error when NEXT_PUBLIC_SITE_URL is missing', async () => {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/db';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        delete process.env.NEXT_PUBLIC_SITE_URL;

        expect(async () => {
            jest.resetModules();
            await import('./env');
        }).toThrow();
    });

    it('treats empty strings as undefined when emptyStringAsUndefined is true', async () => {
        process.env.NODE_ENV = 'development';
        process.env.SUPABASE_DATABASE_URL = '';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
        process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

        expect(async () => {
            jest.resetModules();
            await import('./env');
        }).toThrow();
    });

    it('skips validation when SKIP_ENV_VALIDATION is set', async () => {
        process.env.SKIP_ENV_VALIDATION = 'true';
        process.env.NODE_ENV = 'development';
        delete process.env.SUPABASE_DATABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;

        // Should not throw
        jest.resetModules();
        const { env } = await import('./env');

        expect(env).toBeDefined();
    });

    it('accepts valid database URL formats', async () => {
        const validUrls = [
            'postgresql://user:pass@localhost:5432/db',
            'postgres://host/database',
            'postgresql://localhost/mydb',
        ];

        for (const url of validUrls) {
            process.env.NODE_ENV = 'development';
            process.env.SUPABASE_DATABASE_URL = url;
            process.env.NEXT_PUBLIC_SUPABASE_URL =
                'https://supabase.example.com';
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
            process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

            jest.resetModules();
            const { env } = await import('./env');

            expect(env.SUPABASE_DATABASE_URL).toBe(url);
        }
    });

    it('accepts valid Supabase URLs', async () => {
        const validUrls = [
            'https://abc.supabase.co',
            'https://project.supabase.com',
            'http://localhost:54321',
        ];

        for (const url of validUrls) {
            process.env.NODE_ENV = 'development';
            process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost/db';
            process.env.NEXT_PUBLIC_SUPABASE_URL = url;
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
            process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

            jest.resetModules();
            const { env } = await import('./env');

            expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(url);
        }
    });

    it('accepts various publishable key formats', async () => {
        const validKeys = [
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
            'test-key-123',
            'pk_live_abcdef123456',
        ];

        for (const key of validKeys) {
            process.env.NODE_ENV = 'development';
            process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost/db';
            process.env.NEXT_PUBLIC_SUPABASE_URL =
                'https://supabase.example.com';
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
            process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

            jest.resetModules();
            const { env } = await import('./env');

            expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(key);
        }
    });
});
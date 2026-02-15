// Test setup for Bun test runner
import { beforeAll } from 'bun:test';

// Set up happy-dom as the DOM environment
beforeAll(() => {
    // Configure test environment
    process.env.NODE_ENV = 'test';

    // Set required environment variables for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com';
    process.env.SUPABASE_DATABASE_URL = 'postgresql://localhost:5432/test';
});
import { describe, expect, it, jest } from 'bun:test';
import { render } from '@testing-library/react';

// Mock dependencies
jest.mock('~/styles/globals.css', () => ({}));

jest.mock('next/font/google', () => ({
    Inter: jest.fn(() => ({
        variable: '--font-inter-mock',
        className: 'inter-class',
    })),
}));

jest.mock('~/trpc/react', () => ({
    TRPCReactProvider: ({ children }: any) => <div data-testid="trpc-provider">{children}</div>,
}));

jest.mock('@mino/ui/sonner', () => ({
    Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('./auth/auth-context', () => ({
    AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
}));

const RootLayout = (await import('./layout')).default;
const { metadata } = await import('./layout');

describe('RootLayout', () => {
    it('renders children', () => {
        const { container } = render(
            <RootLayout>
                <div data-testid="child-content">Test Content</div>
            </RootLayout>,
        );

        const childContent = container.querySelector('[data-testid="child-content"]');
        expect(childContent).toBeDefined();
        expect(childContent?.textContent).toBe('Test Content');
    });

    it('wraps content in TRPCReactProvider', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const provider = container.querySelector('[data-testid="trpc-provider"]');
        expect(provider).toBeDefined();
    });

    it('wraps content in AuthProvider', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const provider = container.querySelector('[data-testid="auth-provider"]');
        expect(provider).toBeDefined();
    });

    it('renders Toaster component', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const toaster = container.querySelector('[data-testid="toaster"]');
        expect(toaster).toBeDefined();
    });

    it('sets html lang attribute to en', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const html = container.querySelector('html');
        expect(html?.getAttribute('lang')).toBe('en');
    });

    it('applies Inter font variable to html element', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const html = container.querySelector('html');
        expect(html?.className).toContain('--font-inter-mock');
    });

    it('has correct provider nesting order', () => {
        const { container } = render(
            <RootLayout>
                <div data-testid="test-child">Test</div>
            </RootLayout>,
        );

        // TRPCReactProvider should contain AuthProvider
        const trpcProvider = container.querySelector('[data-testid="trpc-provider"]');
        const authProvider = container.querySelector('[data-testid="auth-provider"]');

        expect(trpcProvider).toBeDefined();
        expect(authProvider).toBeDefined();
        expect(trpcProvider?.contains(authProvider!)).toBe(true);
    });

    it('Toaster is rendered inside AuthProvider', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const authProvider = container.querySelector('[data-testid="auth-provider"]');
        const toaster = container.querySelector('[data-testid="toaster"]');

        expect(authProvider).toBeDefined();
        expect(toaster).toBeDefined();
        expect(authProvider?.contains(toaster!)).toBe(true);
    });

    it('renders html and body structure', () => {
        const { container } = render(
            <RootLayout>
                <div>Test</div>
            </RootLayout>,
        );

        const html = container.querySelector('html');
        const body = container.querySelector('body');

        expect(html).toBeDefined();
        expect(body).toBeDefined();
        expect(html?.contains(body!)).toBe(true);
    });
});

describe('metadata', () => {
    it('has correct title', () => {
        expect(metadata.title).toBe('Mino - AI IDE for designers');
    });

    it('has correct description', () => {
        expect(metadata.description).toBe(
            'Mino is the AI IDE for designers. Modify styles, move elements, and have changes reflected in your codebase.',
        );
    });

    it('has favicon icon configuration', () => {
        expect(metadata.icons).toBeDefined();
        expect(Array.isArray(metadata.icons)).toBe(true);
        expect((metadata.icons as any)[0]).toEqual({
            rel: 'icon',
            url: '/favicon.ico',
        });
    });

    it('is exported as named export', () => {
        expect(metadata).toBeDefined();
        expect(typeof metadata).toBe('object');
    });
});
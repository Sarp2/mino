import { describe, expect, it, jest } from 'bun:test';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return ({ children, href }: any) => <a href={href}>{children}</a>;
});

const PageError = (await import('./page')).default;

describe('PageError component', () => {
    it('renders error page with title', () => {
        render(<PageError />);

        expect(screen.getByText('Something went wrong')).toBeDefined();
    });

    it('renders login error label', () => {
        render(<PageError />);

        expect(screen.getByText('Login Error')).toBeDefined();
    });

    it('renders error description message', () => {
        render(<PageError />);

        expect(
            screen.getByText(/We could not complete the sign-in flow/i),
        ).toBeDefined();
    });

    it('renders full error message text', () => {
        render(<PageError />);

        const message = screen.getByText(/Please try again/i);
        expect(message).toBeDefined();
        expect(message.textContent).toContain(
            'We could not complete the sign-in flow. Please try again. If the issue continues, wait a moment and retry.',
        );
    });

    it('renders back to home button', () => {
        render(<PageError />);

        const homeLink = screen.getByText('Back to home');
        expect(homeLink).toBeDefined();
        expect(homeLink.closest('a')?.getAttribute('href')).toBe('/');
    });

    it('renders back to login link', () => {
        render(<PageError />);

        const loginLink = screen.getByText('Back to login');
        expect(loginLink).toBeDefined();
        expect(loginLink.getAttribute('href')).toBe('/login');
    });

    it('applies correct CSS classes to main container', () => {
        const { container } = render(<PageError />);

        const mainDiv = container.querySelector('.bg-muted\\/30');
        expect(mainDiv).toBeDefined();
        expect(mainDiv?.className).toContain('min-h-screen');
    });

    it('applies correct CSS classes to content card', () => {
        const { container } = render(<PageError />);

        const card = container.querySelector('.border-border');
        expect(card).toBeDefined();
        expect(card?.className).toContain('rounded-3xl');
        expect(card?.className).toContain('backdrop-blur');
    });

    it('renders radial gradient background element', () => {
        const { container } = render(<PageError />);

        const gradient = container.querySelector(
            '[class*="radial-gradient"]',
        );
        expect(gradient).toBeDefined();
    });

    it('has uppercase tracking on the error label', () => {
        render(<PageError />);

        const label = screen.getByText('Login Error');
        expect(label.className).toContain('uppercase');
    });

    it('renders both action buttons', () => {
        render(<PageError />);

        const buttons = screen.getAllByRole('button');
        const links = screen.getAllByRole('link');

        expect(buttons.length + links.length).toBeGreaterThanOrEqual(2);
    });

    it('home button has primary styling', () => {
        render(<PageError />);

        const homeButton = screen.getByText('Back to home').closest('button');
        expect(homeButton?.className).toContain('bg-primary');
    });

    it('login link has border styling', () => {
        render(<PageError />);

        const loginLink = screen.getByText('Back to login');
        expect(loginLink.className).toContain('border');
    });

    it('renders heading with correct font weight', () => {
        render(<PageError />);

        const heading = screen.getByText('Something went wrong');
        expect(heading.className).toContain('font-light');
    });

    it('applies responsive text sizing to heading', () => {
        render(<PageError />);

        const heading = screen.getByText('Something went wrong');
        expect(heading.className).toContain('text-3xl');
        expect(heading.className).toContain('md:text-4xl');
    });

    it('wraps home link in button element', () => {
        render(<PageError />);

        const homeLink = screen.getByText('Back to home');
        const button = homeLink.closest('button');
        expect(button).toBeDefined();
        expect(button?.getAttribute('type')).toBe('button');
    });
});
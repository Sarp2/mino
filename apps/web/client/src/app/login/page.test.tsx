import { describe, expect, it, jest, beforeEach } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { SignInMethod } from '@mino/models';

// Mock dependencies
jest.mock('next/image', () => {
    return ({ src, alt, fill, quality, className, priority }: any) => (
        <img
            src={src}
            alt={alt}
            className={className}
            data-fill={fill}
            data-quality={quality}
            data-priority={priority}
        />
    );
});

jest.mock('../_components/login-button', () => ({
    LoginButton: ({ content, method, providerName }: any) => (
        <button data-testid={`login-${method}`} data-provider={providerName}>
            {content}
        </button>
    ),
    DevLoginButton: () => <button data-testid="dev-login">Dev Login</button>,
}));

jest.mock('@mino/ui/icons/index', () => ({
    Icons: {
        Google: () => <div data-testid="google-icon" />,
        Github: () => <div data-testid="github-icon" />,
    },
}));

const LoginPage = (await import('./page')).default;

describe('LoginPage', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it('renders welcome message', () => {
        render(<LoginPage />);

        expect(screen.getByText(/Welcome To Mino!/i)).toBeDefined();
    });

    it('renders tagline description', () => {
        render(<LoginPage />);

        expect(
            screen.getByText(/A next-generation code editor/i),
        ).toBeDefined();
    });

    it('renders full tagline text', () => {
        render(<LoginPage />);

        const tagline = screen.getByText(/lets designers/i);
        expect(tagline.textContent).toContain('designers');
        expect(tagline.textContent).toContain('product managers');
    });

    it('renders Google login button', () => {
        render(<LoginPage />);

        const googleButton = screen.getByTestId('login-google');
        expect(googleButton).toBeDefined();
        expect(googleButton.textContent).toBe('Continue with Google');
    });

    it('renders GitHub login button', () => {
        render(<LoginPage />);

        const githubButton = screen.getByTestId('login-github');
        expect(githubButton).toBeDefined();
        expect(githubButton.textContent).toBe('Continue with Github');
    });

    it('passes correct method to Google login button', () => {
        render(<LoginPage />);

        const googleButton = screen.getByTestId('login-google');
        expect(googleButton.getAttribute('data-testid')).toBe('login-google');
    });

    it('passes correct method to GitHub login button', () => {
        render(<LoginPage />);

        const githubButton = screen.getByTestId('login-github');
        expect(githubButton.getAttribute('data-testid')).toBe('login-github');
    });

    it('passes correct provider name to buttons', () => {
        render(<LoginPage />);

        const googleButton = screen.getByTestId('login-google');
        const githubButton = screen.getByTestId('login-github');

        expect(googleButton.getAttribute('data-provider')).toBe('Google');
        expect(githubButton.getAttribute('data-provider')).toBe('Github');
    });

    it('renders login image', () => {
        render(<LoginPage />);

        const image = screen.getByAltText('Login visual');
        expect(image).toBeDefined();
        expect(image.getAttribute('src')).toBe('/login.jpg');
    });

    it('renders image with correct quality', () => {
        render(<LoginPage />);

        const image = screen.getByAltText('Login visual');
        expect(image.getAttribute('data-quality')).toBe('100');
    });

    it('renders image with priority loading', () => {
        render(<LoginPage />);

        const image = screen.getByAltText('Login visual');
        expect(image.getAttribute('data-priority')).toBe('true');
    });

    it('renders "Or continue with" separators', () => {
        render(<LoginPage />);

        const separators = screen.getAllByText('Or continue with');
        expect(separators.length).toBeGreaterThanOrEqual(1);
    });

    it('renders dev login button in development mode', () => {
        process.env.NODE_ENV = 'development';

        render(<LoginPage />);

        const devButton = screen.getByTestId('dev-login');
        expect(devButton).toBeDefined();
    });

    it('does not render dev login button in production mode', () => {
        process.env.NODE_ENV = 'production';

        render(<LoginPage />);

        const devButton = screen.queryByTestId('dev-login');
        expect(devButton).toBeNull();
    });

    it('applies correct layout classes', () => {
        const { container } = render(<LoginPage />);

        const mainDiv = container.querySelector('.flex');
        expect(mainDiv).toBeDefined();
        expect(mainDiv?.className).toContain('h-dvh');
        expect(mainDiv?.className).toContain('w-dvw');
    });

    it('renders left and right sections', () => {
        const { container } = render(<LoginPage />);

        const sections = container.querySelectorAll('section');
        expect(sections.length).toBe(2);
    });

    it('applies responsive flex direction', () => {
        const { container } = render(<LoginPage />);

        const mainDiv = container.querySelector('.flex');
        expect(mainDiv?.className).toContain('flex-col');
        expect(mainDiv?.className).toContain('md:flex-row');
    });

    it('hides image section on mobile', () => {
        const { container } = render(<LoginPage />);

        const imageSection = container.querySelector('section.hidden');
        expect(imageSection).toBeDefined();
        expect(imageSection?.className).toContain('md:block');
    });

    it('applies rounded corners to image container', () => {
        const { container } = render(<LoginPage />);

        const imageContainer = container.querySelector('.rounded-3xl');
        expect(imageContainer).toBeDefined();
    });

    it('renders heading with correct font styling', () => {
        render(<LoginPage />);

        const heading = screen.getByText(/Welcome To Mino!/i);
        expect(heading.className).toContain('font-light');
        expect(heading.className).toContain('tracking-tighter');
    });

    it('renders description with muted text color', () => {
        render(<LoginPage />);

        const description = screen.getByText(/A next-generation code editor/i);
        expect(description.className).toContain('text-muted-foreground');
    });

    it('renders separator with border styling', () => {
        const { container } = render(<LoginPage />);

        const borders = container.querySelectorAll('.border-border');
        expect(borders.length).toBeGreaterThan(0);
    });

    it('shows two separators in development mode', () => {
        process.env.NODE_ENV = 'development';

        render(<LoginPage />);

        const separators = screen.getAllByText('Or continue with');
        expect(separators.length).toBe(2);
    });

    it('shows one separator in production mode', () => {
        process.env.NODE_ENV = 'production';

        render(<LoginPage />);

        const separators = screen.getAllByText('Or continue with');
        expect(separators.length).toBe(1);
    });
});
import { describe, expect, it, jest, beforeEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInMethod } from '@mino/models';
import { LoginButton, DevLoginButton } from './login-button';
import { AuthProvider } from '../auth/auth-context';

// Mock dependencies
jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
    },
}));

jest.mock('../login/actions', () => ({
    login: jest.fn(),
    devLogin: jest.fn(),
}));

jest.mock('@mino/ui/button', () => ({
    Button: ({ children, onClick, disabled, className }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={className}
            data-testid="button"
        >
            {children}
        </button>
    ),
}));

jest.mock('@mino/ui/icons/index', () => ({
    Icons: {
        LoadingSpinner: ({ className }: any) => (
            <div className={className} data-testid="loading-spinner" />
        ),
        Github: () => <div data-testid="github-icon" />,
        Google: () => <div data-testid="google-icon" />,
    },
}));

jest.mock('@mino/ui/lib', () => ({
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const { toast } = await import('sonner');

describe('LoginButton', () => {
    const mockIcon = <div data-testid="test-icon">Icon</div>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with provided content and icon', () => {
        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
            </AuthProvider>,
        );

        expect(screen.getByText('Continue with GitHub')).toBeDefined();
        expect(screen.getByTestId('test-icon')).toBeDefined();
    });

    it('applies custom className when provided', () => {
        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                    className="custom-class"
                />
            </AuthProvider>,
        );

        const container = screen.getByText('Continue with GitHub').parentElement
            ?.parentElement;
        expect(container?.className).toContain('custom-class');
    });

    it('calls handleLogin when clicked', async () => {
        const { login } = await import('../login/actions');

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith(SignInMethod.GITHUB);
        });
    });

    it('shows loading spinner when signing in', async () => {
        const { login } = await import('../login/actions');
        (login as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('loading-spinner')).toBeDefined();
        });
    });

    it('disables button when any sign-in is in progress', async () => {
        const { login } = await import('../login/actions');
        (login as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
                <LoginButton
                    content="Continue with Google"
                    method={SignInMethod.GOOGLE}
                    icon={mockIcon}
                    providerName="Google"
                />
            </AuthProvider>,
        );

        const buttons = screen.getAllByTestId('button');
        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(buttons[0].hasAttribute('disabled')).toBe(true);
            expect(buttons[1].hasAttribute('disabled')).toBe(true);
        });
    });

    it('shows error toast when login fails', async () => {
        const { login } = await import('../login/actions');
        const error = new Error('Authentication failed');
        (login as jest.Mock).mockRejectedValue(error);

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Error signing in with GitHub',
                {
                    description: 'Authentication failed',
                },
            );
        });
    });

    it('shows generic error message when error is not an Error instance', async () => {
        const { login } = await import('../login/actions');
        (login as jest.Mock).mockRejectedValue('Something went wrong');

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with Google"
                    method={SignInMethod.GOOGLE}
                    icon={mockIcon}
                    providerName="Google"
                />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                'Error signing in with Google',
                {
                    description: 'Please try again.',
                },
            );
        });
    });

    it('logs error to console when login fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const { login } = await import('../login/actions');
        const error = new Error('Network error');
        (login as jest.Mock).mockRejectedValue(error);

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error signing in with GitHub:',
                error,
            );
        });

        consoleErrorSpy.mockRestore();
    });

    it('applies secondary background when signing in', async () => {
        const { login } = await import('../login/actions');
        (login as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={mockIcon}
                    providerName="GitHub"
                />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('bg-secondary');
        });
    });
});

describe('DevLoginButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with demo user text', () => {
        render(
            <AuthProvider>
                <DevLoginButton />
            </AuthProvider>,
        );

        expect(screen.getByText('Continue with Demo User')).toBeDefined();
    });

    it('calls handleDevLogin when clicked', async () => {
        const { devLogin } = await import('../login/actions');

        render(
            <AuthProvider>
                <DevLoginButton />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(devLogin).toHaveBeenCalled();
        });
    });

    it('shows loading spinner when dev login is in progress', async () => {
        const { devLogin } = await import('../login/actions');
        (devLogin as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <DevLoginButton />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('loading-spinner')).toBeDefined();
        });
    });

    it('disables button when dev login is in progress', async () => {
        const { devLogin } = await import('../login/actions');
        (devLogin as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <DevLoginButton />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.hasAttribute('disabled')).toBe(true);
        });
    });

    it('applies secondary background when dev login is in progress', async () => {
        const { devLogin } = await import('../login/actions');
        (devLogin as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <DevLoginButton />
            </AuthProvider>,
        );

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('bg-secondary');
        });
    });

    it('disables button when other sign-in method is active', async () => {
        const { login } = await import('../login/actions');
        (login as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 1000)),
        );

        render(
            <AuthProvider>
                <LoginButton
                    content="Continue with GitHub"
                    method={SignInMethod.GITHUB}
                    icon={<div>Icon</div>}
                    providerName="GitHub"
                />
                <DevLoginButton />
            </AuthProvider>,
        );

        const buttons = screen.getAllByTestId('button');
        fireEvent.click(buttons[0]); // Click GitHub button

        await waitFor(() => {
            expect(buttons[1].hasAttribute('disabled')).toBe(true);
        });
    });
});
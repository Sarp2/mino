import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';

import { SignInMethod } from '@mino/models';

import { DevLoginButton, LoginButton } from '@/app/_components/login-button';

const mockHandleLogin = mock();
const mockHandleDevLogin = mock();
const mockToastError = mock();
const mockIsRedirectError = mock();
let signingInMethod: SignInMethod | null = null;

await mock.module('@/app/auth/auth-context', () => ({
    useAuthContext: () => ({
        handleLogin: mockHandleLogin,
        handleDevLogin: mockHandleDevLogin,
        signingInMethod,
    }),
}));

await mock.module('sonner', () => ({
    toast: { error: mockToastError },
}));

await mock.module('next/dist/client/components/redirect-error', () => ({
    isRedirectError: mockIsRedirectError,
}));

const renderLoginButton = ({
    method = SignInMethod.GITHUB,
    content = 'Continue with GitHub',
    providerName = 'GitHub',
}: {
    method?: SignInMethod.GITHUB | SignInMethod.GOOGLE;
    content?: string;
    providerName?: 'GitHub' | 'Google';
} = {}) =>
    render(
        <LoginButton
            method={method}
            content={content}
            providerName={providerName}
            icon={<span>icon</span>}
        />,
    );

afterEach(() => {
    cleanup();
});

describe('LoginButton', () => {
    beforeEach(() => {
        signingInMethod = null;
        mockHandleLogin.mockReset();
        mockHandleDevLogin.mockReset();
        mockToastError.mockReset();
        mockIsRedirectError.mockReset();
    });

    test('calls handleLogin with a correct method on click (GitHub)', async () => {
        mockHandleLogin.mockResolvedValue(undefined);
        renderLoginButton();

        await act(() =>
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'icon Continue with GitHub',
                }),
            ),
        );

        expect(mockHandleLogin).toHaveBeenCalledWith(SignInMethod.GITHUB);
    });

    test('handleLogin with a correct method on click (Google)', async () => {
        mockHandleLogin.mockResolvedValue(undefined);
        renderLoginButton({
            method: SignInMethod.GOOGLE,
            content: 'Continue with Google',
            providerName: 'Google',
        });

        await act(() =>
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'icon Continue with Google',
                }),
            ),
        );

        expect(mockHandleLogin).toHaveBeenCalledWith(SignInMethod.GOOGLE);
    });

    test('shows toast error when handleLogin throws a non-redirect error', async () => {
        mockHandleLogin.mockRejectedValue('fail');
        renderLoginButton();

        await act(() =>
            fireEvent.click(
                screen.getByRole('button', {
                    name: 'icon Continue with GitHub',
                }),
            ),
        );

        expect(mockToastError).toHaveBeenCalledWith(
            'Error signing in with GitHub',
            {
                description: 'Please try again.',
            },
        );
    });

    test('button is disabled when signingInMethod is set', async () => {
        signingInMethod = SignInMethod.GITHUB;
        renderLoginButton();

        const button = screen.getByRole('button', {
            name: 'Continue with GitHub',
        });

        expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    test('shows loader icon when signingInMethod is set', async () => {
        signingInMethod = SignInMethod.GITHUB;
        renderLoginButton();

        const button = screen.getByRole('button', {
            name: 'Continue with GitHub',
        });

        expect(button.querySelector('svg.animate-spin')).toBeTruthy();
    });
});

describe('LoginDevButton', () => {
    beforeEach(() => {
        signingInMethod = null;
        mockHandleLogin.mockReset();
        mockHandleDevLogin.mockReset();
    });

    test('calls handleDevLogin on click correctly', async () => {
        mockHandleDevLogin.mockResolvedValue(undefined);
        render(<DevLoginButton />);

        await act(() =>
            fireEvent.click(
                screen.getByRole('button', { name: 'Continue with Demo User' }),
            ),
        );

        expect(mockHandleDevLogin).toHaveBeenCalled();
    });

    test('button is disabled when signingInMethod is set', async () => {
        signingInMethod = SignInMethod.DEV;
        render(<DevLoginButton />);

        const button = screen.getByRole('button');

        expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    test('shows loader icon when signingInMethod is set', async () => {
        signingInMethod = SignInMethod.DEV;
        render(<DevLoginButton />);

        const button = screen.getByRole('button');

        expect(button.querySelector('svg.animate-spin')).toBeTruthy();
    });
});

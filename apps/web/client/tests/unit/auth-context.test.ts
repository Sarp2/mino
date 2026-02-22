import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, mock, test } from 'bun:test';

import { SignInMethod } from '@mino/models';

import { AuthProvider, useAuthContext } from '@/app/auth/auth-context';

const mockLogin = mock();
const mockDevLogin = mock();

await mock.module('@/app/login/actions', () => ({
    login: mockLogin,
    devLogin: mockDevLogin,
}));

const render = () =>
    renderHook(() => useAuthContext(), { wrapper: AuthProvider });

describe('useAuthContext', () => {
    beforeEach(() => {
        mockLogin.mockReset();
        mockDevLogin.mockReset();
    });

    test('initial values are correct after components mounts', () => {
        const { result } = render();

        expect(result.current.signingInMethod).toBeNull();
        expect(result.current.isAuthModalOpen).toBe(false);

        expect(typeof result.current.handleLogin).toBe('function');
        expect(typeof result.current.handleDevLogin).toBe('function');
        expect(typeof result.current.setIsAuthModalOpen).toBe('function');
    });

    test('handleLogin calls login with the correct method', async () => {
        mockLogin.mockResolvedValue(undefined);
        const { result } = render();

        await act(() => result.current.handleLogin(SignInMethod.GITHUB));
        expect(mockLogin).toHaveBeenCalledWith(SignInMethod.GITHUB);
    });

    test('handleLogin resets signingInMethod to null after error', async () => {
        mockLogin.mockRejectedValue('fail');
        const { result } = render();

        await act(() =>
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            result.current.handleLogin(SignInMethod.GOOGLE).catch(() => {}),
        );
        expect(result.current.signingInMethod).toBeNull();
    });

    test('handleLogin resets sigingInMehotd to null after success', async () => {
        mockLogin.mockResolvedValue(undefined);
        const { result } = render();

        await act(() => result.current.handleLogin(SignInMethod.GOOGLE));
        expect(result.current.signingInMethod).toBeNull();
    });

    test('handleDevLogin resets signingInMethod to null after error', async () => {
        const { result } = render();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        await act(() => result.current.handleDevLogin().catch(() => {}));
        expect(result.current.signingInMethod).toBeNull();
    });

    test('handleDevLogin resets signingInMethod to null after success', async () => {
        mockDevLogin.mockResolvedValue(undefined);
        const { result } = render();

        await act(() => result.current.handleDevLogin());
        expect(result.current.signingInMethod).toBeNull();
    });

    test('setIsAuthModalOpen correctly updates isAuthModelOpen', async () => {
        const { result } = render();
        act(() => result.current.setIsAuthModalOpen(true));
        expect(result.current.isAuthModalOpen).toBe(true);
    });

    test('useAuthContext throws error when used outside of AuthProvider', () => {
        expect(() => renderHook(() => useAuthContext())).toThrow(
            'useAuthContext must be used within a AuthProvider',
        );
    });
});

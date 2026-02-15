import { describe, expect, it, jest, beforeEach } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { SignInMethod } from '@mino/models';
import { AuthProvider, useAuthContext } from './auth-context';

// Mock the login actions
jest.mock('../login/actions', () => ({
    login: jest.fn(),
    devLogin: jest.fn(),
}));

const { login, devLogin } = await import('../login/actions');

describe('AuthProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useAuthContext', () => {
        it('throws error when used outside AuthProvider', () => {
            expect(() => {
                renderHook(() => useAuthContext());
            }).toThrow('useAuthContext must be used within a AuthProvider');
        });

        it('provides auth context when used within AuthProvider', () => {
            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            expect(result.current).toBeDefined();
            expect(result.current.signingInMethod).toBeNull();
            expect(result.current.isAuthModelOpen).toBe(false);
            expect(typeof result.current.handleLogin).toBe('function');
            expect(typeof result.current.handleDevLogin).toBe('function');
            expect(typeof result.current.setIsAuthModelOpen).toBe('function');
        });
    });

    describe('handleLogin', () => {
        it('sets signingInMethod during login process', async () => {
            (login as jest.Mock).mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            expect(result.current.signingInMethod).toBeNull();

            const loginPromise = act(async () => {
                await result.current.handleLogin(SignInMethod.GITHUB);
            });

            // Check that signingInMethod is set during login
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
            });

            await loginPromise;

            expect(login).toHaveBeenCalledWith(SignInMethod.GITHUB);
        });

        it('clears signingInMethod after successful login', async () => {
            (login as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await act(async () => {
                await result.current.handleLogin(SignInMethod.GOOGLE);
            });

            expect(result.current.signingInMethod).toBeNull();
            expect(login).toHaveBeenCalledWith(SignInMethod.GOOGLE);
        });

        it('clears signingInMethod after failed login', async () => {
            const error = new Error('Login failed');
            (login as jest.Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await expect(
                act(async () => {
                    await result.current.handleLogin(SignInMethod.GITHUB);
                }),
            ).rejects.toThrow('Login failed');

            expect(result.current.signingInMethod).toBeNull();
        });

        it('logs error on login failure', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const error = new Error('Network error');
            (login as jest.Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await expect(
                act(async () => {
                    await result.current.handleLogin(SignInMethod.GOOGLE);
                }),
            ).rejects.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error signing in with method: ',
                SignInMethod.GOOGLE,
                error,
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('handleDevLogin', () => {
        it('sets signingInMethod to DEV during login', async () => {
            (devLogin as jest.Mock).mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100)),
            );

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            expect(result.current.signingInMethod).toBeNull();

            const loginPromise = act(async () => {
                await result.current.handleDevLogin();
            });

            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
            });

            await loginPromise;

            expect(devLogin).toHaveBeenCalled();
        });

        it('clears signingInMethod after successful dev login', async () => {
            (devLogin as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await act(async () => {
                await result.current.handleDevLogin();
            });

            expect(result.current.signingInMethod).toBeNull();
            expect(devLogin).toHaveBeenCalled();
        });

        it('clears signingInMethod after failed dev login', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const error = new Error('Dev login failed');
            (devLogin as jest.Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await act(async () => {
                await result.current.handleDevLogin();
            });

            expect(result.current.signingInMethod).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error signing in with password',
                error,
            );

            consoleErrorSpy.mockRestore();
        });

        it('does not throw error on dev login failure (errors are caught)', async () => {
            jest.spyOn(console, 'error').mockImplementation();
            const error = new Error('Dev login failed');
            (devLogin as jest.Mock).mockRejectedValue(error);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await act(async () => {
                await result.current.handleDevLogin();
            });

            expect(result.current.signingInMethod).toBeNull();
        });
    });

    describe('isAuthModelOpen state', () => {
        it('initializes with isAuthModelOpen as false', () => {
            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            expect(result.current.isAuthModelOpen).toBe(false);
        });

        it('updates isAuthModelOpen when setIsAuthModelOpen is called', () => {
            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            act(() => {
                result.current.setIsAuthModelOpen(true);
            });

            expect(result.current.isAuthModelOpen).toBe(true);

            act(() => {
                result.current.setIsAuthModelOpen(false);
            });

            expect(result.current.isAuthModelOpen).toBe(false);
        });
    });

    describe('concurrent login attempts', () => {
        it('handles multiple login method calls', async () => {
            (login as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useAuthContext(), {
                wrapper: AuthProvider,
            });

            await act(async () => {
                await result.current.handleLogin(SignInMethod.GITHUB);
            });

            await act(async () => {
                await result.current.handleLogin(SignInMethod.GOOGLE);
            });

            expect(login).toHaveBeenCalledTimes(2);
            expect(result.current.signingInMethod).toBeNull();
        });
    });
});
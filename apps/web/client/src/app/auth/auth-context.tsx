'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import localforage from 'localforage';

import type { ReactNode } from 'react';

import { LocalForageKeys } from '@/utils/constants';
import { devLogin, login, SignInMethod } from '../login/actions';

const LAST_SIGN_IN_METHOD_KEY = 'lastSignInMethod';

interface AuthContextType {
    signingInMethod: SignInMethod | null;
    lastSignInMethod: SignInMethod | null;
    isAuthModelOpen: boolean;
    setIsAuthModelOpen: (open: boolean) => void;
    handleLogin: (
        method: SignInMethod.GITHUB | SignInMethod.GOOGLE,
        returnUrl: string | null,
    ) => Promise<void>;
    handleDevLogin: (returnUrl: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [lastSignInMethod, setLastSignInMethod] =
        useState<SignInMethod | null>(null);

    const [signingInMethod, setSigningInMethod] = useState<SignInMethod | null>(
        null,
    );
    const [isAuthModelOpen, setIsAuthModelOpen] = useState<boolean>(false);

    useEffect(() => {
        const getLastSignInMethod = async () => {
            const lastSignInMethod =
                await localforage.getItem<SignInMethod | null>(
                    LAST_SIGN_IN_METHOD_KEY,
                );
            setLastSignInMethod(lastSignInMethod);
        };
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getLastSignInMethod();
    }, []);

    const handleLogin = async (
        method: SignInMethod.GITHUB | SignInMethod.GOOGLE,
        returnUrl: string | null,
    ) => {
        try {
            setSigningInMethod(method);
            if (returnUrl) {
                await localforage.setItem(
                    LocalForageKeys.RETURN_URL,
                    returnUrl,
                );
            }
            await localforage.setItem(LAST_SIGN_IN_METHOD_KEY, method);
            await login(method);
        } catch (error) {
            console.error('Error signing in with method: ', method, error);
            throw error;
        } finally {
            setSigningInMethod(null);
        }
    };

    const handleDevLogin = async (returnUrl: string | null) => {
        try {
            setSigningInMethod(SignInMethod.DEV);
            if (returnUrl) {
                await localforage.setItem(
                    LocalForageKeys.RETURN_URL,
                    returnUrl,
                );
            }
            await devLogin();
        } catch (error) {
            console.error('Error signing in with password', error);
        } finally {
            setSigningInMethod(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                signingInMethod,
                lastSignInMethod,
                handleLogin,
                handleDevLogin,
                isAuthModelOpen,
                setIsAuthModelOpen,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within a AuthProvider');
    }
};

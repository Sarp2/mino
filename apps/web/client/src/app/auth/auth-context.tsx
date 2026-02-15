'use client';

import { createContext, useContext, useState } from 'react';

import type { ReactNode } from 'react';

import { SignInMethod } from '@mino/models';

import { devLogin, login } from '../login/actions';

interface AuthContextType {
    signingInMethod: SignInMethod | null;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: (open: boolean) => void;
    handleLogin: (
        method: SignInMethod.GITHUB | SignInMethod.GOOGLE,
    ) => Promise<void>;
    handleDevLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [signingInMethod, setSigningInMethod] = useState<SignInMethod | null>(
        null,
    );
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

    const handleLogin = async (
        method: SignInMethod.GITHUB | SignInMethod.GOOGLE,
    ) => {
        try {
            setSigningInMethod(method);
            await login(method);
        } catch (error) {
            console.error('Error signing in with method: ', method, error);
            throw error;
        } finally {
            setSigningInMethod(null);
        }
    };

    const handleDevLogin = async () => {
        try {
            setSigningInMethod(SignInMethod.DEV);
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
                handleLogin,
                handleDevLogin,
                isAuthModalOpen,
                setIsAuthModalOpen,
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
    return context;
};

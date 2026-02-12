import '~/styles/globals.css';

import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TRPCReactProvider } from '~/trpc/react';

import { Toaster } from '@mino/ui/sonner';

import { AuthProvider } from './auth/auth-context';

export const metadata: Metadata = {
    title: 'Mino - AI IDE for designers',
    description:
        'Mino is the AI IDE for designers. Modify styles, move elements, and have changes reflected in your codebase.',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${inter.variable}`}>
            <body>
                <TRPCReactProvider>
                    <AuthProvider>
                        {children}
                        <Toaster />
                    </AuthProvider>
                </TRPCReactProvider>
            </body>
        </html>
    );
}

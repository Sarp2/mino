import '~/styles/globals.css';

import { type Metadata } from 'next';
import { Geist } from 'next/font/google';
import { TRPCReactProvider } from '~/trpc/react';

export const metadata: Metadata = {
    title: 'Mino - AI IDE for designers',
    description:
        'Mino is the AI IDE for designers. Modify styles, move elements, and have changes reflected in your codebase.',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${geist.variable}`}>
            <body>
                <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}

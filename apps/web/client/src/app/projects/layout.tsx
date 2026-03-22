import type { Metadata } from 'next';

import { requireAuth } from '@/utils/auth/require-auth';

export const metadata: Metadata = {
    title: 'Mino',
    description: 'Mino - Projects',
};

export default async function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    await requireAuth();
    return <>{children}</>;
}

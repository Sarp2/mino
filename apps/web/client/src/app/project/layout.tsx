import { requireAuth } from '@/utils/auth/require-auth';

export default async function Layout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    await requireAuth();
    return <>{children}</>;
}

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useHashParams } from '@/hooks/use-hash-params';
import { resolveAuthErrorKind } from '@/utils/auth/resolve-auth-error-kind';
import { AUTH_ERROR_VIEWS, Routes } from '@/utils/constants';

const PageError = () => {
    const searchParams = useSearchParams();
    const hashParams = useHashParams();

    // Prefer hash params (used by Supabase redirect flows) over query params
    const get = (key: string) =>
        hashParams?.get(key) ?? searchParams.get(key) ?? null;

    const view = useMemo(() => {
        const kind = resolveAuthErrorKind(
            get('error_code'),
            get('error_description'),
        );
        return AUTH_ERROR_VIEWS[kind];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hashParams, searchParams]);

    return (
        <div className="bg-muted/30 relative flex min-h-screen w-full items-center justify-center overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary)/10,transparent_60%)]" />

            <div className="border-border bg-background/95 relative w-full max-w-xl rounded-3xl border p-8 shadow-2xl backdrop-blur">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                    {view.eyebrow}
                </p>

                <h1 className="text-foreground mt-3 text-3xl font-light tracking-tight md:text-4xl">
                    {view.title}
                </h1>

                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                    {view.description}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href={Routes.HOME}
                        className="bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition hover:opacity-90"
                    >
                        Back to home
                    </Link>
                    <Link
                        href={Routes.LOGIN}
                        className="border-border text-foreground hover:bg-secondary inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PageError;

'use client';

import Link from 'next/link';

import { Routes } from '@/utils/constants';

const PageError = () => {
    return (
        <div className="bg-muted/30 relative flex min-h-screen w-full items-center justify-center overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-primary)/10,transparent_60%)]" />

            <div className="border-border bg-background/95 relative w-full max-w-xl rounded-3xl border p-8 shadow-2xl backdrop-blur">
                <p className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                    Login Error
                </p>
                <h1 className="text-foreground mt-3 text-3xl font-light tracking-tight md:text-4xl">
                    Something went wrong
                </h1>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                    We could not complete the sign-in flow. Please try again. If
                    the issue continues, wait a moment and retry.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        className="bg-primary text-primary-foreground inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition hover:opacity-90"
                    >
                        <Link href={Routes.HOME}>Back to home</Link>
                    </button>
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

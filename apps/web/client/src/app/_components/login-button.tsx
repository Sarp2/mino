import { toast } from 'sonner';

import type { ReactNode } from 'react';

import { SignInMethod } from '@mino/models';
import { Button } from '@mino/ui/button';
import { Icons } from '@mino/ui/icons/index';
import { cn } from '@mino/ui/lib';

import { useAuthContext } from '../auth/auth-context';

interface LoginButtonProps {
    content: string;
    className?: string;
    returnUrl?: string | null;
    method: SignInMethod.GITHUB | SignInMethod.GOOGLE;
    icon: ReactNode;
    providerName: string;
}

export const LoginButton = ({
    content,
    className,
    returnUrl,
    method,
    icon,
    providerName,
}: LoginButtonProps) => {
    const { handleLogin, signingInMethod } = useAuthContext();
    const isSigningIn = signingInMethod === method;

    const handleLoginClick = async () => {
        try {
            await handleLogin(method, returnUrl ?? null);
        } catch (error) {
            console.error(`Error signing in with ${providerName}:`, error);
            toast.error(`Error signing in with ${providerName}`, {
                description:
                    error instanceof Error
                        ? error.message
                        : 'Please try again.',
            });
        }
    };

    return (
        <div className={cn('flex w-full flex-col items-center', className)}>
            <Button
                variant="outline"
                className={cn(
                    'border-border hover:bg-secondary flex w-full items-center justify-center gap-3 rounded-2xl border py-4 text-[16px] transition-colors',
                    isSigningIn && 'bg-secondary',
                )}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleLoginClick}
                disabled={!!signingInMethod}
            >
                {isSigningIn ? (
                    <Icons.LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    icon
                )}
                {content}
            </Button>
        </div>
    );
};

export const DevLoginButton = ({ returnUrl }: { returnUrl: string | null }) => {
    const { handleDevLogin, signingInMethod } = useAuthContext();
    const isSigningIn = signingInMethod === SignInMethod.DEV;

    return (
        <Button
            variant="outline"
            className={cn(
                'border-border hover:bg-secondary flex w-full items-center justify-center gap-3 rounded-2xl border py-4 text-[16px] transition-colors',
                isSigningIn && 'bg-secondary',
            )}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() => handleDevLogin(returnUrl)}
            disabled={!!signingInMethod}
        >
            {isSigningIn ? (
                <Icons.LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                'Continue with Demo User'
            )}
        </Button>
    );
};

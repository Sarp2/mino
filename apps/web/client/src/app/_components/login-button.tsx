import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import { SignInMethod } from '@mino/models';
import { Button } from '@mino/ui/button';
import { cn } from '@mino/ui/lib';

import { useAuthContext } from '../auth/auth-context';

interface LoginButtonProps {
    className?: string;
    returnUrl?: string;
    method: SignInMethod.GITHUB | SignInMethod.GOOGLE;
    icon: React.ReactNode;
    providerName: string;
}

export const LoginButton = ({
    className,
    returnUrl,
    method,
    icon,
    providerName,
}: LoginButtonProps) => {
    const { lastSignInMethod, handleLogin, signingInMethod } = useAuthContext();
    const isLastSignInMethod = lastSignInMethod === method;
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
                    'text-active w-full items-center justify-center text-sm',
                    isLastSignInMethod
                        ? 'text-small border-teal-300 bg-teal-100 text-teal-900 hover:border-teal-500/70 hover:bg-teal-200/50 dark:border-teal-700 dark:bg-teal-950 dark:text-teal-100 dark:hover:border-teal-500 dark:hover:bg-teal-800'
                        : 'bg-black',
                )}
                onClick={handleLoginClick}
                disabled={!!signingInMethod}
            >
                {isSigningIn ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    icon
                )}
            </Button>
            {isLastSignInMethod && (
                <p className="mt-1 text-sm text-teal-500">
                    You used this last time
                </p>
            )}
        </div>
    );
};

export const DevLoginButton = ({ returnUrl }: { returnUrl: string }) => {
    const { handleDevLogin, signingInMethod } = useAuthContext();
    const isSigningIn = signingInMethod === SignInMethod.DEV;

    return (
        <Button
            variant="outline"
            className="w-full text-sm"
            onClick={() => handleDevLogin(returnUrl)}
            disabled={!!signingInMethod}
        >
            {isSigningIn ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                'DEV MODE: Sign in as demo user'
            )}
        </Button>
    );
};

'use client';

import Image from 'next/image';

import { SignInMethod } from '@mino/models';
import { Icons } from '@mino/ui/icons/index';

import { DevLoginButton, LoginButton } from '../_components/login-button';

const LoginPage = () => {
    // eslint-disable-next-line no-restricted-properties
    const isDev = process.env.NODE_ENV === 'development';

    return (
        <div className="flex h-dvh w-dvw flex-col md:flex-row">
            {/* Left Section */}
            <section className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center justify-center gap-6">
                        <h1 className="text-4xl leading-tight font-semibold md:text-5xl">
                            <span className="text-foreground font-light tracking-tighter">
                                Welcome To Mino!
                            </span>
                        </h1>
                        <p className="text-muted-foreground whitespace-nowrap">
                            A next-generation code editor that lets designers
                            <br />
                            and product managers craft web experiences code
                        </p>

                        <LoginButton
                            content="Continue with Google"
                            method={SignInMethod.GOOGLE}
                            icon={<Icons.Google />}
                            providerName="Google"
                        />

                        <div className="animate-element animate-delay-700 relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="border-border w-full border-t" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-background text-muted-foreground px-4 text-sm">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <LoginButton
                            content="Continue with Github"
                            method={SignInMethod.GITHUB}
                            icon={<Icons.Github />}
                            providerName="Github"
                        />

                        {isDev && (
                            <>
                                <div className="animate-element animate-delay-700 relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="border-border w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background text-muted-foreground px-4 text-sm">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>
                                <DevLoginButton />
                            </>
                        )}
                    </div>
                </div>
            </section>
            <section className="relative hidden h-full w-full flex-1 p-3 md:block">
                <div className="relative h-full w-full overflow-hidden rounded-3xl">
                    <Image
                        src="/login.jpg"
                        alt="Login visual"
                        fill
                        quality={100}
                        className="object-cover object-center"
                        priority
                    />
                </div>
            </section>
        </div>
    );
};

export default LoginPage;

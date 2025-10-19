'use client';

import { SignInIcon, SignOutIcon, UserIcon } from '@phosphor-icons/react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX } from 'react';
import { LoadingIndicator } from './loading-indicator';

export function NavbarUserSection({ origin }: { origin: string }): JSX.Element {
    const session = useSession();
    const pathname = usePathname();
    const queryParams = new URLSearchParams();
    queryParams.append('callbackUrl', pathname !== '/sign-in' ? `${origin}${pathname}` : origin);
    let loggedIn = 'Bejelentkezve';
    if (session.data?.provider) {
        loggedIn += ` ${session.data.provider}-fiókkal`;
    }
    if (session.data?.user?.name) {
        loggedIn += ` mint ${session.data.user.name}`;
    }
    if (session.data?.user?.email) {
        loggedIn += ` (${session.data.user.email})`;
    }
    return (
        <>
            {session.status === 'authenticated' && (
                <>
                    <div
                        className="flex h-6.5 w-6.5 items-center justify-center overflow-hidden rounded-md border-1"
                        aria-label={loggedIn}
                        title={loggedIn}
                    >
                        {session.data.user?.image && (
                            <Image src={session.data.user.image} width={24} height={24} alt="" />
                        )}
                        {!session.data.user?.image && <UserIcon size={16} />}
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="interactivity interactivity-normal"
                        aria-label="Kijelentkezés"
                    >
                        <SignOutIcon />
                    </button>
                </>
            )}
            {session.status === 'unauthenticated' && (
                <Link
                    href={`/sign-in?${queryParams}`}
                    className="interactivity interactivity-normal"
                    aria-label="Bejelentkezés"
                >
                    <SignInIcon />
                </Link>
            )}
            {session.status === 'loading' && (
                <div
                    className="flex h-6.5 w-6.5 items-center justify-center overflow-hidden rounded-md border-1"
                    aria-label={loggedIn}
                    title={loggedIn}
                >
                    <LoadingIndicator size={16} />
                </div>
            )}
        </>
    );
}

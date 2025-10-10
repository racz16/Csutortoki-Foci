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
                        className="h-4 w-4 overflow-hidden rounded-full border-1"
                        aria-label={loggedIn}
                        title={loggedIn}
                    >
                        {session.data.user?.image && (
                            <Image src={session.data.user.image} width={14} height={14} alt="" />
                        )}
                        {!session.data.user?.image && <UserIcon size={14} />}
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="cursor-pointer hover:text-sky-600"
                        aria-label="Kijelentkezés"
                    >
                        <SignOutIcon />
                    </button>
                </>
            )}
            {session.status === 'unauthenticated' && (
                <Link
                    href={`/sign-in?${queryParams}`}
                    className="cursor-pointer hover:text-sky-600"
                    aria-label="Bejelentkezés"
                >
                    <SignInIcon />
                </Link>
            )}
            {session.status === 'loading' && <LoadingIndicator size={16} />}
        </>
    );
}

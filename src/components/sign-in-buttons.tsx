'use client';

import {
    DiscordLogoIcon,
    GithubLogoIcon,
    GoogleLogoIcon,
    RedditLogoIcon,
    SquaresFourIcon,
} from '@phosphor-icons/react';
import { OAuthProviderType } from 'next-auth/providers/oauth-types';
import { signIn, useSession } from 'next-auth/react';
import { redirect, useSearchParams } from 'next/navigation';
import { JSX } from 'react';
import { SignInButtonsSkeleton } from './skeletons/sing-in-buttons-skeleton';

interface SignInButtonData {
    providerId: OAuthProviderType;
    name: string;
    icon: JSX.Element;
    classes: string;
    hoverClasses: string;
}

export function SignInButtons(): JSX.Element | JSX.Element[] {
    const session = useSession();
    const searchParams = useSearchParams();
    if (session.status === 'authenticated') {
        redirect('/');
    }
    if (session.status === 'loading') {
        return <SignInButtonsSkeleton />;
    }
    const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
    const buttons: SignInButtonData[] = [
        {
            providerId: 'google',
            name: 'Google',
            icon: <GoogleLogoIcon weight="fill" />,
            classes: 'bg-[#DB4437] text-white',
            hoverClasses: 'hover:bg-white hover:text-[#DB4437]',
        },
        {
            providerId: 'azure-ad',
            name: 'Microsoft',
            icon: <SquaresFourIcon weight="fill" />,
            classes: 'bg-[#00A4EF] text-white',
            hoverClasses: 'hover:bg-white hover:text-[#00A4EF]',
        },
        {
            providerId: 'reddit',
            name: 'Reddit',
            icon: <RedditLogoIcon weight="fill" />,
            classes: 'bg-[#FF4500] text-white',
            hoverClasses: 'hover:bg-white hover:text-[#FF4500]',
        },
        {
            providerId: 'discord',
            name: 'Discord',
            icon: <DiscordLogoIcon weight="fill" />,
            classes: 'bg-[#5865F2] text-[#E0E3FF]',
            hoverClasses: 'hover:bg-[#E0E3FF] hover:text-[#5865F2]',
        },
        {
            providerId: 'github',
            name: 'GitHub',
            icon: <GithubLogoIcon weight="fill" />,
            classes: 'bg-black text-white',
            hoverClasses: 'hover:bg-white hover:text-black',
        },
    ];
    return buttons.map((b) => (
        <button
            onClick={() => signIn(b.providerId, { callbackUrl })}
            className={`flex h-10 w-70 cursor-pointer items-center gap-1 rounded-lg border-1 p-1 text-lg sm:h-12 sm:w-73 sm:gap-2 sm:p-2 ${b.classes} ${b.hoverClasses}`}
            key={b.providerId}
        >
            {b.icon}
            <div>Bejelentkezés {b.name}-fiókkal</div>
        </button>
    ));
}

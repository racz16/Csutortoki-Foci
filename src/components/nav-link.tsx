'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { JSX, ReactNode } from 'react';
import { useNavbarContext } from '../navbar-context';

export function NavLink({
    children,
    href,
    hamburger,
}: {
    children: ReactNode;
    href: string;
    hamburger?: boolean;
}): JSX.Element {
    const pathname = usePathname();
    let className = '';
    if (pathname === href) {
        className = 'font-bold';
    }
    const { toggle } = useNavbarContext();
    return (
        <Link
            href={href}
            className={`interactivity interactivity-normal specular-big text-center sm:w-25 ${className}`}
            onClick={hamburger ? toggle : undefined}
        >
            {children}
        </Link>
    );
}

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
    let classNames = '';
    if (pathname === href) {
        classNames = 'font-bold text-black';
    }
    const { toggle } = useNavbarContext();
    return (
        <Link
            href={href}
            className={`relative text-sky-800 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-sky-600 after:transition-all after:duration-300 hover:text-sky-600 hover:after:w-full ${classNames}`}
            onClick={hamburger ? toggle : undefined}
        >
            {children}
        </Link>
    );
}

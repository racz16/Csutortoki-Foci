'use client';

import { useNavbarContext } from '@/navbar-context';
import { JSX, ReactNode } from 'react';

export function NavbarMenu({ children }: { children: ReactNode }): JSX.Element {
    const { opened } = useNavbarContext();
    const visibilityClass = opened ? 'flex' : 'hidden';
    return (
        <div className={`ms-8 mt-1 flex-col gap-1 sm:hidden ${visibilityClass}`} aria-expanded={opened}>
            {children}
        </div>
    );
}

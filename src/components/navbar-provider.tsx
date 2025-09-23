'use client';

import { NavbarContext } from '@/navbar-context';
import { JSX, useState } from 'react';

export function NavbarProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const [open, setOpen] = useState(false);

    return (
        <NavbarContext.Provider
            value={{
                opened: open,
                toggle: () => setOpen((o) => !o),
            }}
        >
            {children}
        </NavbarContext.Provider>
    );
}

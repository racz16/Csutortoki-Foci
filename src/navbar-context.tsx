'use client';

import { createContext, useContext } from 'react';

type NavbarContextType = {
    opened: boolean;
    toggle: () => void;
};

export const NavbarContext = createContext<NavbarContextType | null>(null);

export function useNavbarContext(): NavbarContextType {
    const context = useContext(NavbarContext);
    if (!context) {
        throw new Error('useNavbarContext used outside of the provider');
    }
    return context;
}

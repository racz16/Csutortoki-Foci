'use client';

import { ListIcon } from '@phosphor-icons/react';
import { JSX } from 'react';
import { useNavbarContext } from '../../navbar-context';

export function HamburgerButton(): JSX.Element {
    const { toggle, opened } = useNavbarContext();
    const ariaLabel = opened ? 'Menü becsukása' : 'Menü kinyitása';
    return (
        <button onClick={toggle} className="interactivity interactivity-normal sm:hidden" aria-label={ariaLabel}>
            <ListIcon />
        </button>
    );
}

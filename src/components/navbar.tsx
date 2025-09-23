import { MoonIcon, SignInIcon, SoccerBallIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';
import { HamburgerButton } from './hamburger-button';
import { NavLink } from './nav-link';
import { NavbarMenu } from './navbar-menu';
import { NavbarProvider } from './navbar-provider';

export function Navbar(): JSX.Element {
    const navbarLinks = [
        { id: 1, name: 'Főoldal', href: '/' },
        { id: 2, name: 'Meccsek', href: '/matches' },
        { id: 3, name: 'Játékosok', href: '/players' },
    ];
    return (
        <header className="relative top-0 z-1 flex flex-col border-b-1 bg-white p-2 sm:sticky sm:flex-row lg:justify-center">
            <Link
                className="absolute bottom-100 rounded-lg border-1 bg-white p-2 focus:-bottom-14"
                href="#main-content"
            >
                Ugrás a tartalomhoz
            </Link>
            <NavbarProvider>
                <div className="flex w-full items-baseline justify-between lg:w-5xl">
                    <h1 className="justify-self-start text-2xl">
                        <Link href="/" className="flex items-baseline gap-1">
                            <SoccerBallIcon className="self-center" alt="" />
                            Csütörtöki Foci
                        </Link>
                    </h1>
                    <nav className="hidden gap-4 sm:flex">
                        {navbarLinks.map((nl) => (
                            <NavLink href={nl.href} key={nl.id}>
                                {nl.name}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-baseline gap-2 sm:gap-4">
                        <Link aria-label="Bejelentkezés" href="#">
                            <SignInIcon />
                        </Link>
                        <button aria-label="Váltás sötét módra">
                            <MoonIcon />
                        </button>
                        <HamburgerButton />
                    </div>
                </div>
                <NavbarMenu>
                    {navbarLinks.map((nl) => (
                        <NavLink href={nl.href} hamburger={true} key={nl.id}>
                            {nl.name}
                        </NavLink>
                    ))}
                </NavbarMenu>
            </NavbarProvider>
        </header>
    );
}

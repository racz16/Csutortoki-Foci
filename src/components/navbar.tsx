import { SoccerBallIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';
import { HamburgerButton } from './buttons/hamburger-button';
import { NavLink } from './nav-link';
import { NavbarMenu } from './navbar-menu';
import { NavbarProvider } from './navbar-provider';
import { NavbarUserSection } from './navbar-user-section';

export function Navbar(): JSX.Element {
    const origin = process.env.ORIGIN!;
    const navbarLinks = [
        { id: 1, name: 'Főoldal', href: '/' },
        { id: 2, name: 'Meccsek', href: '/matches' },
        { id: 3, name: 'Játékosok', href: '/players' },
    ];
    return (
        <header className="glass-navbar sticky top-0 z-1 flex flex-col justify-center p-2 sm:flex-row">
            <Link
                className="absolute bottom-100 self-center rounded-lg border-1 bg-white p-2 focus:-bottom-12 sm:focus:-bottom-14"
                href="#main-content"
            >
                Ugrás a tartalomhoz
            </Link>
            <NavbarProvider>
                <div className="flex w-full items-center justify-between lg:w-5xl">
                    <h1 className="justify-self-start text-2xl">
                        <Link href="/" className="flex items-center gap-1 hover:text-gray-700">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                                <SoccerBallIcon className="shrink-0" alt="" />
                            </div>
                            <span>Csütörtöki Foci</span>
                        </Link>
                    </h1>
                    <nav className="hidden gap-4 sm:flex">
                        {navbarLinks.map((nl) => (
                            <NavLink href={nl.href} key={nl.id}>
                                {nl.name}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <NavbarUserSection origin={origin} />
                        {/* <button disabled aria-label="Váltás sötét módra">
                            <MoonIcon />
                        </button> */}
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

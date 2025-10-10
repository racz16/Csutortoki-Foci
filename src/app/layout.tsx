import { Navbar } from '@/components/navbar';
import SessionProvider from '@/components/session-provider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { JSX, ReactNode } from 'react';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Csütörtöki Foci',
    description: 'Statisztikák a Csütörtöki Focihoz',
    icons: { icon: './favicon.ico' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
    return (
        <html lang="hu">
            <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
                <SessionProvider>
                    <Navbar />
                    <main id="main-content" className="flex grow-1 justify-center focus:outline-0" tabIndex={-1}>
                        <div className="m-2 mt-4 w-full sm:m-2 sm:mt-4 lg:w-5xl">{children}</div>
                    </main>
                </SessionProvider>
            </body>
        </html>
    );
}

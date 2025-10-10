import { SessionContextValue } from 'next-auth/react';
import { connection } from 'next/server';
import { ExtendedSession } from './app/api/auth/[...nextauth]/route';

export async function Wait(timeout = 1000): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

const LOCALE = 'hu';
const TIME_ZONE = 'Europe/Budapest';

export function formatDate(date: Date): string {
    return date.toLocaleDateString(LOCALE, { timeZone: TIME_ZONE });
}

export function formatDateTime(date: Date): string {
    return date.toLocaleString(LOCALE, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIME_ZONE,
    });
}

export function formatNumberMaxDigits(value: number, maxDigits: number): string {
    return value.toLocaleString(LOCALE, { maximumFractionDigits: maxDigits });
}

export function formatNumberMinMaxDigits(value: number, minMaxDigits: number, sign?: boolean): string {
    return value.toLocaleString(LOCALE, {
        minimumFractionDigits: minMaxDigits,
        maximumFractionDigits: minMaxDigits,
        signDisplay: sign ? 'always' : undefined,
    });
}

export async function preventPrerenderingInCiPipeline(): Promise<void> {
    if (process.env.PREVENT_PRERENDERING) {
        await connection();
    }
}

export function isAdmin(session: SessionContextValue): boolean {
    return session.status === 'authenticated' && (session.data as ExtendedSession).admin;
}

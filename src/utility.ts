import { SessionContextValue } from 'next-auth/react';
import { Chivo_Mono } from 'next/font/google';
import { connection } from 'next/server';

export async function Wait(timeout = 1000): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

export const DEFAULT_MU = 25;
export const DEFAULT_SIGMA = DEFAULT_MU / 3;

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

export function formatDateTimeToDateTimeLocal(date: Date): string {
    const dtf = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: TIME_ZONE,
    });
    const parts = dtf.formatToParts(date);
    const year = parts.findLast((p) => p.type === 'year')?.value;
    const month = parts.findLast((p) => p.type === 'month')?.value;
    const day = parts.findLast((p) => p.type === 'day')?.value;
    const hour = parts.findLast((p) => p.type === 'hour')?.value;
    const minute = parts.findLast((p) => p.type === 'minute')?.value;
    return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function getTimeZoneOffset(date: Date): number {
    const dtf = new Intl.DateTimeFormat(LOCALE, {
        timeZoneName: 'shortOffset',
        timeZone: TIME_ZONE,
    });
    const parts = dtf.formatToParts(date);
    const timeZoneName = parts.findLast((p) => p.type === 'timeZoneName')?.value;
    const match = timeZoneName?.match(/GMT([+-]\d+)/);
    return match ? parseInt(match[1]) : 0;
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
    return session.status === 'authenticated' && session.data.admin;
}

export class ValidationError extends Error {}

export const chivoMonoFont = Chivo_Mono({ weight: '400', subsets: ['latin'] });

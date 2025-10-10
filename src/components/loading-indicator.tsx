'use client';

import { CircleNotchIcon } from '@phosphor-icons/react';
import { JSX } from 'react';

export function LoadingIndicator({ size }: { size: number }): JSX.Element {
    return <CircleNotchIcon size={size} className="animate-spin" aria-label="Betöltés" />;
}

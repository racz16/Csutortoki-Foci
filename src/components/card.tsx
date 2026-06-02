import { Size } from '@/dtos/types';
import { JSX, ReactNode } from 'react';

export function Card({
    children,
    className = '',
    size = 'large',
}: {
    children: ReactNode;
    className?: string;
    size?: Size;
}): JSX.Element {
    let classes = size === 'small' ? 'h-full rounded-lg p-1 glass-nested' : 'rounded-2xl p-1 sm:p-2 glass';
    classes += ' ' + className;
    return <article className={classes}>{children}</article>;
}

import { JSX, ReactNode } from 'react';

export function Card({
    children,
    className = '',
    size = 'large',
}: {
    children: ReactNode;
    className?: string;
    size?: 'small' | 'large';
}): JSX.Element {
    let classes = size === 'small' ? 'h-full rounded-lg border-1 p-1' : 'h-full rounded-2xl border-1 p-1 sm:p-2';
    classes += ' ' + className;
    return <article className={classes}>{children}</article>;
}

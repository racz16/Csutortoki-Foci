import { JSX } from 'react';

export function ButtonSkeleton(): JSX.Element {
    return <div className="h-6.5 w-6.5 animate-pulse rounded-md bg-gray-500/50"></div>;
}

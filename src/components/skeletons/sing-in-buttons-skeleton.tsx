import { JSX } from 'react';

export function SignInButtonsSkeleton(): JSX.Element {
    return (
        <div className="flex flex-col gap-3 sm:gap-6">
            <div className="h-10 w-65 animate-pulse rounded-lg bg-gray-500/50 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-65 animate-pulse rounded-lg bg-gray-500/50 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-65 animate-pulse rounded-lg bg-gray-500/50 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-65 animate-pulse rounded-lg bg-gray-500/50 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-65 animate-pulse rounded-lg bg-gray-500/50 sm:h-12 sm:w-73"></div>
        </div>
    );
}

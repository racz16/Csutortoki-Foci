import { JSX } from 'react';

export function SignInButtonsSkeleton(): JSX.Element {
    return (
        <div className="flex animate-pulse flex-col gap-4 sm:gap-6">
            <div className="h-10 w-70 rounded-lg bg-gray-200 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-70 rounded-lg bg-gray-200 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-70 rounded-lg bg-gray-200 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-70 rounded-lg bg-gray-200 sm:h-12 sm:w-73"></div>
            <div className="h-10 w-70 rounded-lg bg-gray-200 sm:h-12 sm:w-73"></div>
        </div>
    );
}

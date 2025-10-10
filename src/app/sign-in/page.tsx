import { SignInButtons } from '@/components/sign-in-buttons';
import { SignInButtonsSkeleton } from '@/components/skeletons/sing-in-buttons-skeleton';
import { SoccerBallIcon } from '@phosphor-icons/react/dist/ssr';
import { JSX, Suspense } from 'react';

export default function SignInPage(): JSX.Element {
    return (
        <div className="flex h-full items-center justify-evenly gap-4 sm:gap-6">
            <SoccerBallIcon size={256} weight="thin" className="hidden shrink-0 sm:block" />
            <div className="flex flex-col gap-4 sm:gap-6">
                <h2 className="text-4xl">Bejelentkezés</h2>
                <Suspense fallback={<SignInButtonsSkeleton />}>
                    <SignInButtons />
                </Suspense>
            </div>
        </div>
    );
}

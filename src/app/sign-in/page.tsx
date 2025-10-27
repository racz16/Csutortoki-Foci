import { Card } from '@/components/card';
import { SignInButtons } from '@/components/sign-in-buttons';
import { SignInButtonsSkeleton } from '@/components/skeletons/sing-in-buttons-skeleton';
import { SoccerBallIcon } from '@phosphor-icons/react/dist/ssr';
import { JSX, Suspense } from 'react';

export default function SignInPage(): JSX.Element {
    return (
        <div className="flex h-full items-center justify-center">
            <Card className="flex items-center justify-evenly gap-3 p-3 sm:gap-6 sm:p-6">
                <div className="hidden h-50 w-50 shrink-0 items-center justify-center overflow-hidden rounded-full sm:flex">
                    <SoccerBallIcon size={256} weight="light" className="shrink-0 bg-white/50" />
                </div>
                <div className="flex flex-col gap-3 sm:gap-6">
                    <h2 className="text-4xl">Bejelentkezés</h2>
                    <Suspense fallback={<SignInButtonsSkeleton />}>
                        <SignInButtons />
                    </Suspense>
                </div>
            </Card>
        </div>
    );
}

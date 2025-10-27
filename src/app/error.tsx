'use client';

import { Card } from '@/components/card';
import { SoccerBallIcon } from '@phosphor-icons/react';
import { JSX } from 'react';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }): JSX.Element {
    return (
        <div className="flex h-full items-center">
            <Card>
                <div className="flex items-center justify-evenly gap-3 p-3 sm:gap-6 sm:p-6">
                    <div className="hidden h-50 w-50 shrink-0 items-center justify-center overflow-hidden rounded-full sm:flex">
                        <SoccerBallIcon size={256} weight="light" className="shrink-0 bg-white/50" />
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:gap-6">
                        <h2 className="w-full text-4xl">Ez nem feature, hanem bug</h2>
                        <p>
                            Valami hiba történt a betöltése közben. Próbáld meg újratölteni az oldalt. Akár az is
                            előfordulhat, hogy segít. De azért ne legyenek nagy reményeid. Ha a hiba továbbra is
                            fennáll, akkor írj egy emailt:&nbsp;
                            <a href="mailto:zalan.racz.dev@gmail.com" className="link">
                                zalan.racz.dev@gmail.com
                            </a>
                        </p>
                        <button onClick={reset} className="interactivity interactivity-normal">
                            Oldal újratöltése
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

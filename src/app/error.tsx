'use client';

import { SoccerBallIcon } from '@phosphor-icons/react';
import { JSX } from 'react';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }): JSX.Element {
    return (
        <div className="flex h-full items-center justify-evenly gap-4 sm:gap-6">
            <SoccerBallIcon size={256} weight="thin" className="hidden shrink-0 sm:block" />
            <div className="flex flex-col items-center gap-4 sm:gap-6">
                <h2 className="w-full text-4xl">Ez nem feature, hanem bug</h2>
                <p>
                    Valami hiba történt a betöltése közben. Próbáld meg újratölteni az oldalt. Akár az is előfordulhat,
                    hogy segít. De azért ne legyenek nagy reményeid. Ha a hiba továbbra is fennáll, akkor írj egy
                    emailt:&nbsp;
                    <a href="mailto:zalan.racz.dev@gmail.com" className="text-sky-800 hover:text-sky-600">
                        zalan.racz.dev@gmail.com
                    </a>
                </p>
                <button className="rounded-2xl border-1 p-2 hover:bg-black hover:text-white" onClick={() => reset()}>
                    Oldal újratöltése
                </button>
            </div>
        </div>
    );
}

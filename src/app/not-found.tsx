import { SoccerBallIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';

export default function NotFoundPage(): JSX.Element {
    return (
        <div className="flex h-full items-center justify-evenly gap-4 sm:gap-6">
            <SoccerBallIcon size={256} weight="thin" className="hidden shrink-0 sm:block" />
            <div className="flex flex-col gap-4 sm:gap-6">
                <h2 className="text-4xl">Az oldal nem létezik</h2>
                <div>
                    <p>
                        Lehet, hogy elrontottad az URL-t, vagy olyan oldalhoz próbálsz hozzáférni, amihez nincs jogod.
                        Én pedig nem hagyhatom, hogy hozzáférj a... szupertitkos foci adatokhoz. De a lényeg, hogy a te
                        hibád. Tuti. Ha mégis ragaszkodsz a tévképzeteidhez, akkor írj egy emailt és szívesen
                        elmagyarázom, hogy miért a te hibád:&nbsp;
                        <a href="mailto:zalan.racz.dev@gmail.com" className="text-sky-800 hover:text-sky-600">
                            zalan.racz.dev@gmail.com
                        </a>
                    </p>
                </div>
                <Link className="w-full text-center text-sky-800 hover:text-sky-600" href="/">
                    Visszatérés a főoldalra
                </Link>
            </div>
        </div>
    );
}

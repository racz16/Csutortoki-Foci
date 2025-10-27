import { Card } from '@/components/card';
import { SoccerBallIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';

export default function NotFoundPage(): JSX.Element {
    return (
        <div className="flex h-full items-center">
            <Card>
                <div className="flex items-center justify-evenly gap-3 p-3 sm:gap-6 sm:p-6">
                    <div className="hidden h-50 w-50 shrink-0 items-center justify-center overflow-hidden rounded-full sm:flex">
                        <SoccerBallIcon size={256} weight="light" className="shrink-0 bg-white/50" />
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:gap-6">
                        <h2 className="w-full text-4xl">Az oldal nem létezik</h2>
                        <div>
                            <p>
                                Lehet, hogy elrontottad az URL-t, vagy olyan oldalhoz próbálsz hozzáférni, amihez nincs
                                jogod. Én pedig nem hagyhatom, hogy hozzáférj a... szupertitkos foci adatokhoz. De a
                                lényeg, hogy a te hibád. Tuti. Ha mégis ragaszkodsz a tévképzeteidhez, akkor írj egy
                                emailt és szívesen elmagyarázom, hogy miért a te hibád:&nbsp;
                                <a href="mailto:zalan.racz.dev@gmail.com" className="link">
                                    zalan.racz.dev@gmail.com
                                </a>
                            </p>
                        </div>
                        <Link className="link text-center" href="/">
                            Visszatérés a főoldalra
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}

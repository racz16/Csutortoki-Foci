'use client';

import { isAdmin } from '@/utility';
import { PlusIcon, StrategyIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';
import { useDialog } from '../dialog-provider';
import { MatchDialog } from '../match-dialog';

export function NewMatchButton({ playerCount }: { playerCount: number }): JSX.Element {
    const { open } = useDialog();
    const session = useSession();
    const admin = isAdmin(session);
    return (
        <button
            onClick={() => open(MatchDialog, {}, 'large')}
            className="interactivity interactivity-normal"
            disabled={playerCount < 2}
            title={playerCount < 2 ? 'Egy meccshez kell legalább 2 játékos' : undefined}
            aria-label={admin ? 'Létrehozás' : 'Meccs tervező'}
        >
            {admin ? <PlusIcon weight="bold" /> : <StrategyIcon weight="bold" />}
        </button>
    );
}

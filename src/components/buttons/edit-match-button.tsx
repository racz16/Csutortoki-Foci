'use client';

import { MatchDto } from '@/dtos/match-dto';
import { isAdmin } from '@/utility';
import { PencilIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';
import { useDialog } from '../dialog-provider';
import { MatchDialog } from '../match-dialog';

export function EditMatchButton({ match }: { match: MatchDto }): JSX.Element {
    const { open } = useDialog();
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => open(MatchDialog, { match }, 'large')}
            className="interactivity interactivity-normal"
            aria-label="Meccs szerkesztése"
        >
            <PencilIcon />
        </button>
    );
}

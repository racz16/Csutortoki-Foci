'use client';

import { createMatchEndpoint, editMatchEndpoint } from '@/actions';
import { LocationDto } from '@/dtos/location-dto';
import { MatchDto } from '@/dtos/match-dto';
import { PlayerDto } from '@/dtos/player-dto';
import { formatDateTimeToDateTimeLocal, formatNumberMinMaxDigits, getTimeZoneOffset, isAdmin } from '@/utility';
import { CaretLeftIcon, CaretRightIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Team, predictDraw, predictWin, rating } from 'openskill';
import { useActionState, useEffect, useState } from 'react';
import { useDialog } from './dialog-provider';

type PlayerGroup = 0 | 1 | 'player';
type MatchKey = 'date' | 'score1' | 'score2' | 'location' | 'team1' | 'team2';

export function MatchDialog({ match }: { match?: MatchDto }) {
    const { close } = useDialog();
    const session = useSession();
    const admin = isAdmin(session);
    const [location, setLocation] = useState<number | undefined>(match?.locationId);
    const [players, setPlayers] = useState<PlayerDto[]>([]);
    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [teams, setTeams] = useState<PlayerDto[][]>([[], []]);
    const matchAction = match ? editMatchEndpoint : createMatchEndpoint;
    const [state, action, isPending] = useActionState(matchAction, {
        successful: false,
        state: match
            ? {
                  id: match.id,
                  date: match.date,
                  score1: match.team[0].score,
                  score2: match.team[1].score,
              }
            : undefined,
    });
    const [dirtyFields, setDirtyFields] = useState<Set<MatchKey>>(new Set());
    const [loading, setLoading] = useState<boolean>(true);

    const now = new Date();
    const nowWithoutSecondsAndMilliseconds = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            0,
            0
        )
    );
    const timeZoneOffset = getTimeZoneOffset(now);
    const endOfToday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23 - timeZoneOffset, 59)
    );

    useEffect(() => {
        if (state.successful) {
            close();
        }
    }, [close, state]);

    useEffect(() => {
        setDirtyFields(new Set());
    }, [state]);

    useEffect(() => {
        async function fetchLocations() {
            if (admin) {
                const locationsResponse = await fetch('/api/locations');
                const locationsJson: LocationDto[] = await locationsResponse.json();
                setLocations(locationsJson);
            }
        }
        fetchLocations();
    }, [admin]);

    useEffect(() => {
        async function fetchPlayers() {
            const params = new URLSearchParams();
            if (match) {
                params.append('date', match.date);
            }
            const playersResponse = await fetch(`/api/players?${params}`);
            const playersJson: PlayerDto[] = await playersResponse.json();
            setPlayers(
                match
                    ? playersJson.filter(
                          (p) =>
                              !match.team[0].teamPlayer.map((tp) => tp.playerId).includes(p.id) &&
                              !match.team[1].teamPlayer.map((tp) => tp.playerId).includes(p.id)
                      )
                    : playersJson
            );
            setTeams(
                match
                    ? [
                          playersJson.filter((p) => match.team[0].teamPlayer.map((tp) => tp.playerId).includes(p.id)),
                          playersJson.filter((p) => match.team[1].teamPlayer.map((tp) => tp.playerId).includes(p.id)),
                      ]
                    : [[], []]
            );
            setLoading(false);
        }
        fetchPlayers();
    }, [match]);

    function setDirty(key: MatchKey): void {
        setDirtyFields((prev) => new Set(prev).add(key));
    }

    function sort(a: PlayerDto, b: PlayerDto): number {
        if (!a.regular && b.regular) {
            return 1;
        } else if (a.regular && !b.regular) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        }
        return a.id - b.id;
    }

    function move(from: PlayerGroup, to: PlayerGroup, id: number): void {
        if (from === to) {
            return;
        }
        const fromTeam = from === 'player' ? players : teams[from];
        const player = fromTeam.findLast((p) => p.id === id);
        if (!player) {
            throw new Error();
        }
        setTeams([
            createPlayersArray(from, to, 0, teams[0], player),
            createPlayersArray(from, to, 1, teams[1], player),
        ]);
        setPlayers(createPlayersArray(from, to, 'player', players, player));
        if (from === 0 || to === 0) {
            setDirty('team1');
        }
        if (from === 1 || to === 1) {
            setDirty('team2');
        }
    }

    function createPlayersArray(
        from: PlayerGroup,
        to: PlayerGroup,
        name: PlayerGroup,
        team: PlayerDto[],
        player: PlayerDto
    ): PlayerDto[] {
        if (from === name) {
            return team.filter((p) => p.id !== player.id);
        } else if (to === name) {
            return [...team, { ...player }].sort(sort);
        } else {
            return team;
        }
    }

    async function changeDate(e: React.FocusEvent<HTMLInputElement, Element>): Promise<void> {
        const params = new URLSearchParams();
        params.append('date', e.target.value);
        const playersResponse = await fetch(`/api/players?${params}`);
        const playersJson: PlayerDto[] = await playersResponse.json();
        setPlayers((x) => [...x.map((p) => playersJson.find((z) => z.id === p.id) ?? { ...p })]);
        setTeams((x) => [...x.map((t) => t.map((p) => playersJson.find((z) => z.id === p.id) ?? { ...p }))]);
    }

    function splitPlayers(): void {
        const selectedPlayers = [...teams[0], ...teams[1]].sort((a, b) => a.id - b.id);
        const splitPlayers = computeBestSplit(selectedPlayers);
        if (splitPlayers) {
            setTeams(splitPlayers);
        }
    }

    const predictions = computePredictions(teams);
    return (
        <form
            action={action}
            className={`grid h-full gap-2 sm:gap-4 ${admin ? 'grid-rows-[auto_minmax(0,1fr)_auto]' : 'grid-rows-[auto_minmax(0,1fr)]'}`}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-xl">
                    {admin ? (match ? 'Meccs szerkesztése' : 'Meccs létrehozása') : 'Meccs tervező'}
                </h2>
                <button
                    type="button"
                    onClick={close}
                    className="interactivity interactivity-normal"
                    aria-label="Felugró ablak bezárása"
                >
                    <XIcon />
                </button>
            </div>
            <div
                className={`grid gap-2 overflow-auto sm:grid-cols-3 sm:gap-4 sm:overflow-clip ${admin ? 'grid-rows-[min-content_min-content_min-content_minmax(min-content,1fr)_minmax(min-content,1fr)] sm:grid-rows-[min-content_minmax(0,1fr)_min-content]' : 'grid-rows-[minmax(min-content,1fr)_minmax(min-content,1fr)] sm:grid-rows-[minmax(0,1fr)_min-content]'}`}
            >
                {admin && (
                    <>
                        {match?.id && <input type="hidden" name="id" value={match.id} />}
                        <div>
                            <label>
                                <div className="text-sm">
                                    Időpont<span className="text-red-800">*</span>
                                </div>
                                <input
                                    onBlur={changeDate}
                                    name="date"
                                    type="datetime-local"
                                    disabled={isPending || loading}
                                    defaultValue={formatDateTimeToDateTimeLocal(
                                        new Date(state.state?.date ?? nowWithoutSecondsAndMilliseconds)
                                    )}
                                    onChange={() => setDirty('date')}
                                    required
                                    max={formatDateTimeToDateTimeLocal(endOfToday)}
                                    className="input"
                                    aria-labelledby="date-error"
                                />
                            </label>
                            <div id="date-error" aria-live="polite" aria-atomic>
                                {state.errors?.date &&
                                    !dirtyFields.has('date') &&
                                    state.errors.date.map((error) => (
                                        <p className="py-1 text-xs text-red-800" key={error}>
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex">
                                <div className="w-full">
                                    <label>
                                        <div className="text-sm">
                                            1. csapat góljai<span className="text-red-800">*</span>
                                        </div>
                                        <input
                                            name="score1"
                                            type="number"
                                            disabled={isPending || loading}
                                            inputMode="numeric"
                                            required
                                            min={0}
                                            max={32767}
                                            defaultValue={state.state?.score1}
                                            onChange={() => setDirty('score1')}
                                            className="input"
                                            aria-labelledby="score1-error"
                                        />
                                    </label>
                                    <div id="score1-error" aria-live="polite" aria-atomic>
                                        {state.errors?.score1 &&
                                            !dirtyFields.has('score1') &&
                                            state.errors.score1.map((error) => (
                                                <p className="py-1 text-xs text-red-800" key={error}>
                                                    {error}
                                                </p>
                                            ))}
                                    </div>
                                </div>
                                <div className="flex items-end" aria-hidden>
                                    <div className="px-2 pb-1.5">-</div>
                                </div>
                                <div className="w-full">
                                    <label>
                                        <div className="text-sm">
                                            2. csapat góljai<span className="text-red-800">*</span>
                                        </div>
                                        <input
                                            name="score2"
                                            type="number"
                                            disabled={isPending || loading}
                                            inputMode="numeric"
                                            required
                                            min={0}
                                            max={32767}
                                            defaultValue={state.state?.score2}
                                            onChange={() => setDirty('score2')}
                                            className="input"
                                            aria-labelledby="score2-error"
                                        />
                                    </label>
                                    <div id="score2-error" aria-live="polite" aria-atomic>
                                        {state.errors?.score2 &&
                                            !dirtyFields.has('score2') &&
                                            state.errors.score2.map((error) => (
                                                <p className="py-1 text-xs text-red-800" key={error}>
                                                    {error}
                                                </p>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label>
                                <div className="text-sm">
                                    Helyszín<span className="text-red-800">*</span>
                                </div>
                                <select
                                    name="location"
                                    disabled={isPending || loading}
                                    required
                                    value={location}
                                    onChange={(e) => {
                                        setLocation(+e.target.value);
                                        setDirty('location');
                                    }}
                                    className="input h-8.5"
                                    aria-labelledby="location-error"
                                >
                                    {locations.map((l) => (
                                        <option value={l.id} key={l.id}>
                                            {l.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div id="location-error" aria-live="polite" aria-atomic>
                                {state.errors?.location &&
                                    !dirtyFields.has('location') &&
                                    state.errors.location.map((error) => (
                                        <p className="py-1 text-xs text-red-800" key={error}>
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </>
                )}

                <div className="grid grid-rows-[min-content_minmax(0,min-content)_min-content] gap-2 sm:grid-rows-[auto_1fr]">
                    <div className="text-sm">1. csapat{admin && <span className="text-red-800">*</span>}</div>
                    <div className={`flex flex-col gap-2 overflow-auto`}>
                        {teams[0].map((p) => (
                            <div
                                className={`glass-nested flex items-center justify-between rounded-md p-1 sm:flex-row-reverse`}
                                key={p.id}
                            >
                                <Link href={`/players/${p.id}`} className="link pl-1 sm:text-right">
                                    {p.name}
                                </Link>
                                <div className="flex gap-1 sm:flex-row-reverse">
                                    <div className="flex h-6.5 w-8 items-center justify-center rounded-sm bg-sky-900/50 text-center text-sm text-white">
                                        <div>{formatNumberMinMaxDigits(p.rating, 1)}</div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isPending || loading}
                                        onClick={() => move(0, 'player', p.id)}
                                        className="interactivity interactivity-danger"
                                        aria-label="Eltávolítás a csapatból"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!!players.length && (
                        <select
                            value={0}
                            onChange={(e) => move('player', 0, +e.currentTarget.value)}
                            className="input sm:hidden"
                        >
                            <option value={0}>Játékos hozzáadása...</option>
                            {players.map((p) => (
                                <option value={p.id} key={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div id="team1-error" aria-live="polite" aria-atomic>
                        {state.errors?.team1 &&
                            !dirtyFields.has('team1') &&
                            state.errors.team1.map((error) => (
                                <p className="py-1 text-xs text-red-800" key={error}>
                                    {error}
                                </p>
                            ))}
                    </div>
                    {teams[0].map((p) => (
                        <input type="hidden" name="team1" value={p.id} key={p.id} />
                    ))}
                </div>

                <div className="hidden grid-rows-[auto_1fr] gap-2 sm:grid">
                    <div className="text-sm">Elérhető játékosok</div>
                    <div className="flex flex-col gap-2 overflow-auto">
                        {players.map((p) => (
                            <div className={`glass-nested flex items-center justify-between rounded-md p-1`} key={p.id}>
                                <div className="order-2 flex flex-col items-center">
                                    <Link href={`/players/${p.id}`} className="link">
                                        {p.name}
                                    </Link>
                                    <div className="flex gap-1">
                                        <div className="flex w-8 items-center justify-center rounded-sm bg-sky-900/50 text-center text-sm text-white">
                                            <div>{formatNumberMinMaxDigits(p.rating, 1)}</div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => move('player', 0, p.id)}
                                    disabled={isPending || loading}
                                    type="button"
                                    className="interactivity interactivity-normal order-1"
                                    aria-label="Hozzárendelés az első csapathoz"
                                >
                                    <CaretLeftIcon />
                                </button>
                                <button
                                    onClick={() => move('player', 1, p.id)}
                                    disabled={isPending || loading}
                                    type="button"
                                    className="interactivity interactivity-normal order-3"
                                    aria-label="Hozzárendelés a második csapathoz"
                                >
                                    <CaretRightIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-rows-[min-content_minmax(0,min-content)_min-content] gap-2 sm:grid-rows-[auto_1fr]">
                    <div className="text-sm">2. csapat{admin && <span className="text-red-800">*</span>}</div>
                    <div className={`flex flex-col gap-2 overflow-auto`}>
                        {teams[1].map((p) => (
                            <div className={`glass-nested flex items-center justify-between rounded-md p-1`} key={p.id}>
                                <Link href={`/players/${p.id}`} className="link pl-1">
                                    {p.name}
                                </Link>
                                <div className="flex gap-1">
                                    <div className="flex h-6.5 w-8 items-center justify-center rounded-sm bg-sky-900/50 text-center text-sm text-white">
                                        <div>{formatNumberMinMaxDigits(p.rating, 1)}</div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isPending || loading}
                                        onClick={() => move(1, 'player', p.id)}
                                        className="interactivity interactivity-danger"
                                        aria-label="Eltávolítás a csapatból"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {!!players.length && (
                        <select
                            value={0}
                            onChange={(e) => move('player', 1, +e.currentTarget.value)}
                            className="input sm:hidden"
                        >
                            <option value={0}>Játékos hozzáadása...</option>
                            {players.map((p) => (
                                <option value={p.id} key={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div id="team2-error" aria-live="polite" aria-atomic>
                        {!dirtyFields.has('team2') &&
                            state.errors?.team2?.map((error) => (
                                <p className="py-1 text-xs text-red-800" key={error}>
                                    {error}
                                </p>
                            ))}
                    </div>
                    {teams[1].map((p) => (
                        <input type="hidden" name="team2" value={p.id} key={p.id} />
                    ))}
                </div>

                <h3 className="hidden text-center text-xl sm:block">{(predictions[0] * 100).toFixed()}%</h3>
                <div className="hidden self-center text-center text-sm sm:block">Esélyek</div>
                <h3 className="hidden text-center text-xl sm:block">{(predictions[1] * 100).toFixed()}%</h3>
            </div>

            {!dirtyFields.size &&
                state.globalErrors?.map((error) => (
                    <div className="text-red-800" key={error}>
                        {error}
                    </div>
                ))}

            <div className="flex justify-center gap-2">
                {admin && (
                    <button
                        type="submit"
                        disabled={isPending || loading}
                        className="interactivity interactivity-normal"
                    >
                        Mentés
                    </button>
                )}
                <button
                    type="button"
                    onClick={splitPlayers}
                    disabled={isPending || loading || teams[0].length + teams[1].length < 2}
                    title={
                        teams[0].length + teams[1].length < 2
                            ? 'Legalább két játékosnak kell részt vennie a meccsen'
                            : undefined
                    }
                    className="interactivity interactivity-normal"
                >
                    Elosztás
                </button>
                <button type="button" onClick={close} className="interactivity interactivity-normal">
                    Mégse
                </button>
            </div>
        </form>
    );
}

function computePredictions(teams: PlayerDto[][]): number[] {
    const osTeams: Team[] = [];
    for (const team of teams) {
        const osTeam: Team = [];
        for (const teamPlayer of team) {
            const osRating = rating({ mu: teamPlayer.mu, sigma: teamPlayer.sigma });
            osTeam.push(osRating);
        }
        osTeams.push(osTeam);
    }
    return predictWin(osTeams);
}

function computeBestSplit(players: PlayerDto[]): [PlayerDto[], PlayerDto[]] | null {
    const playerCount = players.length;
    if (playerCount < 2) {
        return null;
    }

    let bestProbability = -1;
    let bestTeamA: PlayerDto[] = [];
    let bestTeamB: PlayerDto[] = [];
    const teamASize = Math.floor(playerCount / 2);
    const teamBSize = playerCount - teamASize;
    const indices = Array.from({ length: teamASize }, (_, i) => i);
    const currentTeamA = new Array<PlayerDto>(teamASize);
    const currentTeamB = new Array<PlayerDto>(teamBSize);

    while (true) {
        for (let i = 0; i < teamASize; i++) {
            currentTeamA[i] = players[indices[i]];
        }

        let teamAIndex = 0;
        let teamBIndex = 0;
        for (let i = 0; i < playerCount; i++) {
            if (teamAIndex < teamASize && i === indices[teamAIndex]) {
                teamAIndex++;
            } else {
                currentTeamB[teamBIndex++] = players[i];
            }
        }

        if (playerCount % 2 === 1 || currentTeamA[0].id < currentTeamB[0].id) {
            const probability = predictDraw([currentTeamA, currentTeamB]);
            if (probability > bestProbability) {
                bestProbability = probability;
                bestTeamA = currentTeamA.slice();
                bestTeamB = currentTeamB.slice();
            }
        }

        let i = teamASize - 1;
        while (i >= 0 && indices[i] === playerCount - teamASize + i) {
            i--;
        }
        if (i < 0) {
            break;
        }
        indices[i]++;
        for (let j = i + 1; j < teamASize; j++) {
            indices[j] = indices[j - 1] + 1;
        }
    }

    return [bestTeamA, bestTeamB];
}

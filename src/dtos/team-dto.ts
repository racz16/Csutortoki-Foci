import { TeamPlayerDto } from './team-player-dto';

export interface TeamDto {
    score: number;
    chance: number;
    teamPlayer: TeamPlayerDto[];
}

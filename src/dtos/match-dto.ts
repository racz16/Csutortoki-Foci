import { TeamDto } from './team-dto';

export interface MatchDto {
    id: number;
    date: string;
    teams: TeamDto[];
}

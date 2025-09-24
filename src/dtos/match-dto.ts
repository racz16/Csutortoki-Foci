import { TeamDto } from './team-dto';

export interface MatchDto {
    id: number;
    date: string;
    team: TeamDto[];
    location: string;
}

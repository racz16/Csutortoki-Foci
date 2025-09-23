import { MatchDto } from './match-dto';

export interface MatchesDto {
    matches: MatchDto[];
    nextDate: string | null;
}

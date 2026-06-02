import { MatchResultType } from '@/json-types/match-result-type';

export interface PlayerDevelopmentDto {
    date: Date;
    rating: number;
    score1?: number;
    score2?: number;
    result?: MatchResultType;
}

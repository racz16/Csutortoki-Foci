import { MatchResult } from './match-result';

export interface MatchFormStatistic {
    type: 'match-form';
    matches: MatchResult[];
}

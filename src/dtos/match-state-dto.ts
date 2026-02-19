export interface MatchStateDto {
    state?: {
        id?: number;
        date?: string;
        score1?: number;
        score2?: number;
    };
    errors?: {
        date?: string[];
        score1?: string[];
        score2?: string[];
        location?: string[];
        team1?: string[];
        team2?: string[];
    };
    globalErrors?: string[];
    successful: boolean;
}

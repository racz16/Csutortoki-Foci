export interface PlayerStateDto {
    errors?: {
        name?: string[];
        regular?: string[];
    };
    globalErrors?: string[];
}

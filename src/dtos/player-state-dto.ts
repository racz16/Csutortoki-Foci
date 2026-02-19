export interface PlayerStateDto {
    state?: {
        id?: number;
        name?: string;
        regular?: boolean;
    };
    errors?: {
        name?: string[];
        regular?: string[];
    };
    globalErrors?: string[];
    successful: boolean;
}

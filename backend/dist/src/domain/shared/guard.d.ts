export declare const Guard: {
    againstEmpty(value: string | null | undefined, field: string): string;
    oneOf<T extends string>(value: string, allowed: readonly T[], field: string): T;
};

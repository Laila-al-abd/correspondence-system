import { ApplicationError } from '../errors';
export declare const DEFAULT_PAGE_SIZE = 50;
export declare const MAX_PAGE_SIZE = 200;
export interface OffsetPage<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}
export interface KeysetPage<T> {
    items: T[];
    limit: number;
    nextCursor: string | null;
}
export declare class InvalidCursorError extends ApplicationError {
    readonly code = "INVALID_CURSOR";
    readonly status = 400;
    constructor();
}
export declare function clampLimit(raw?: number): number;
export declare function clampOffset(raw?: number): number;
export declare function encodeCursor(payload: Record<string, unknown>): string;
export declare function decodeCursor<T>(raw: string): T;

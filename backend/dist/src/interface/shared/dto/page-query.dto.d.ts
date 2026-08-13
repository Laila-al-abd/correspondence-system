export declare class PageQueryDto {
    limit?: string;
    cursor?: string;
}
export declare class OffsetPageQueryDto {
    limit?: string;
    offset?: string;
}
export declare function toNumber(raw?: string): number | undefined;

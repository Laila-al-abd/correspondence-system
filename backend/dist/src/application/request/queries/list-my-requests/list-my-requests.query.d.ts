export declare class ListMyRequestsQuery {
    readonly requesterId: string;
    readonly limit?: number | undefined;
    readonly cursor?: string | undefined;
    constructor(requesterId: string, limit?: number | undefined, cursor?: string | undefined);
}

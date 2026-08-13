export declare class ListAssignedRequestsQuery {
    readonly userId: string;
    readonly limit?: number | undefined;
    readonly cursor?: string | undefined;
    readonly readyOnly?: boolean | undefined;
    constructor(userId: string, limit?: number | undefined, cursor?: string | undefined, readyOnly?: boolean | undefined);
}

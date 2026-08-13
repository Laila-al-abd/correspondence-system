export declare class ListHitlQueueQuery {
    readonly limit?: number | undefined;
    readonly cursor?: string | undefined;
    constructor(limit?: number | undefined, cursor?: string | undefined);
    static readonly status = "DRAFT";
    static readonly classificationStatus: string[];
}

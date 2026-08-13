export declare class ListRequestQueueQuery {
    readonly status: string;
    readonly limit?: number | undefined;
    readonly cursor?: string | undefined;
    readonly classificationStatus?: string | undefined;
    readonly hasFilledData?: boolean | undefined;
    readonly extracted?: boolean | undefined;
    constructor(status: string, limit?: number | undefined, cursor?: string | undefined, classificationStatus?: string | undefined, hasFilledData?: boolean | undefined, extracted?: boolean | undefined);
}

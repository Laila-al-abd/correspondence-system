export interface RequestContext {
    userId?: string;
    ipAddress?: string;
}
export declare const RequestContextStore: {
    run<T>(context: RequestContext, callback: () => T): T;
    set(patch: Partial<RequestContext>): void;
    userId(): string | undefined;
    ipAddress(): string | undefined;
};

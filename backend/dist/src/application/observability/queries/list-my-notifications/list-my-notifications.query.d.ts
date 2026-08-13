export declare class ListMyNotificationsQuery {
    readonly userId: string;
    readonly onlyUnread: boolean;
    readonly limit?: number | undefined;
    readonly offset?: number | undefined;
    constructor(userId: string, onlyUnread?: boolean, limit?: number | undefined, offset?: number | undefined);
}

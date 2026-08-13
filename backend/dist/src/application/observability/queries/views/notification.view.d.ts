export interface NotificationView {
    id: string;
    type: string;
    title: string;
    body: string | null;
    requestId: string | null;
    isRead: boolean;
    createdAt: string;
}
export interface UnreadCountView {
    unread: number;
}
export interface MarkReadResult {
    marked: number;
}
export interface PurgeResult {
    deleted: number;
    retentionDays: number;
    cutoff: string;
}

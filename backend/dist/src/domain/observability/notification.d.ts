import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
interface NotificationProps {
    userId: Identifier;
    requestId?: Identifier;
    type: string;
    title: string;
    body?: string;
    isRead: boolean;
    createdAt: Date;
}
export declare class Notification extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        userId: Identifier;
        type: string;
        title: string;
        body?: string;
        requestId?: Identifier;
    }): Notification;
    static rehydrate(id: Identifier, props: NotificationProps): Notification;
    snapshot(): {
        userId: string;
        requestId?: string;
        type: string;
        title: string;
        body?: string;
        isRead: boolean;
        createdAt: Date;
    };
    markRead(): void;
    get isRead(): boolean;
    get userId(): Identifier;
}
export {};

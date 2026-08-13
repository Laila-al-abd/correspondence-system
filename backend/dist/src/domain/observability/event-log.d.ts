import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { EventType } from "./enums";
interface EventLogProps {
    requestId?: Identifier;
    requestStepInstanceId?: Identifier;
    actorId?: Identifier;
    actionTypeId?: Identifier;
    eventType: EventType;
    fromStatus?: string;
    toStatus?: string;
    ipAddress?: string;
    occurredAt: Date;
}
export declare class EventLog extends Entity {
    private props;
    private constructor();
    static rehydrate(id: Identifier, props: EventLogProps): EventLog;
    static statusChanged(id: Identifier, p: {
        requestId: Identifier;
        from?: string;
        to: string;
        actorId?: Identifier;
        ipAddress?: string;
    }): EventLog;
    static actionTaken(id: Identifier, p: {
        requestId: Identifier;
        actorId: Identifier;
        actionTypeId: Identifier;
        requestStepInstanceId?: Identifier;
        ipAddress?: string;
    }): EventLog;
    static stepStarted(id: Identifier, p: {
        requestId: Identifier;
        requestStepInstanceId: Identifier;
        actorId?: Identifier;
        ipAddress?: string;
    }): EventLog;
    static stepCompleted(id: Identifier, p: {
        requestId: Identifier;
        requestStepInstanceId: Identifier;
        actorId?: Identifier;
        ipAddress?: string;
    }): EventLog;
    static assigned(id: Identifier, p: {
        requestId: Identifier;
        requestStepInstanceId: Identifier;
        actorId?: Identifier;
        ipAddress?: string;
    }): EventLog;
    snapshot(): {
        requestId?: string;
        requestStepInstanceId?: string;
        actorId?: string;
        actionTypeId?: string;
        eventType: EventType;
        fromStatus?: string;
        toStatus?: string;
        ipAddress?: string;
        occurredAt: Date;
    };
    get eventType(): EventType;
    get requestId(): Identifier | undefined;
}
export {};

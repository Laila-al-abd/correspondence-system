import type { EventLogRepository } from '../../../domain/observability/ports/event-log.repository';
import type { IdGenerator } from '../../../domain/shared/id-generator';
import type { ClientContextPort } from '../ports/client-context.port';
export declare class EventRecorder {
    private readonly events;
    private readonly ids;
    private readonly client;
    constructor(events: EventLogRepository, ids: IdGenerator, client: ClientContextPort);
    statusChanged(p: {
        requestId: string;
        from?: string;
        to: string;
        actorId?: string;
    }): Promise<void>;
    actionTaken(p: {
        requestId: string;
        actorId: string;
        actionTypeId: string;
        stepInstanceId?: string;
    }): Promise<void>;
    stepStarted(p: {
        requestId: string;
        stepInstanceId: string;
        actorId?: string;
    }): Promise<void>;
    stepCompleted(p: {
        requestId: string;
        stepInstanceId: string;
        actorId?: string;
    }): Promise<void>;
    assigned(p: {
        requestId: string;
        stepInstanceId: string;
        actorId?: string;
    }): Promise<void>;
    private actor;
}

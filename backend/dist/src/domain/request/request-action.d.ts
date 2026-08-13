import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
interface RequestActionProps {
    requestId: Identifier;
    requestStepInstanceId?: Identifier;
    actorId: Identifier;
    actionTypeId: Identifier;
    comment?: string;
    createdAt: Date;
}
export interface RequestActionSnapshot {
    requestId: string;
    requestStepInstanceId?: string;
    actorId: string;
    actionTypeId: string;
    comment?: string;
    createdAt: Date;
}
export declare class RequestAction extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        requestId: Identifier;
        actorId: Identifier;
        actionTypeId: Identifier;
        requestStepInstanceId?: Identifier;
        comment?: string;
    }): RequestAction;
    static rehydrate(id: Identifier, props: RequestActionProps): RequestAction;
    get requestId(): Identifier;
    get actorId(): Identifier;
    get actionTypeId(): Identifier;
    get requestStepInstanceId(): Identifier | undefined;
    snapshot(): RequestActionSnapshot;
}
export {};

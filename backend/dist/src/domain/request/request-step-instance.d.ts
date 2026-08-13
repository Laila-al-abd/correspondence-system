import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { StepInstanceStatus } from "./enums";
interface StepInstanceProps {
    requestId: Identifier;
    workflowStepId: Identifier;
    assignedToUserId?: Identifier;
    status: StepInstanceStatus;
    slaDueAt?: Date;
    slaPaused: boolean;
    startedAt?: Date;
    completedAt?: Date;
}
export interface StepInstanceSnapshot {
    id: string;
    requestId: string;
    workflowStepId: string;
    assignedToUserId?: string;
    status: StepInstanceStatus;
    slaDueAt?: Date;
    slaPaused: boolean;
    startedAt?: Date;
    completedAt?: Date;
}
export declare class RequestStepInstance extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        requestId: Identifier;
        workflowStepId: Identifier;
        slaDueAt?: Date;
    }): RequestStepInstance;
    static rehydrate(id: Identifier, props: StepInstanceProps): RequestStepInstance;
    private assertNotTerminal;
    assignTo(userId: Identifier): void;
    start(): void;
    complete(): void;
    reject(): void;
    skip(): void;
    scheduleSla(dueAt: Date): void;
    pauseSla(): void;
    resumeSla(): void;
    get status(): StepInstanceStatus;
    get workflowStepId(): Identifier;
    get assignedToUserId(): Identifier | undefined;
    isTerminal(): boolean;
    isDone(): boolean;
    snapshot(): StepInstanceSnapshot;
}
export {};

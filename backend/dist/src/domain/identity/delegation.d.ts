import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
interface DelegationProps {
    delegatorId: Identifier;
    delegateId: Identifier;
    start: Date;
    end: Date;
    isActive: boolean;
    reason?: string;
}
export declare class Delegation extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        delegatorId: Identifier;
        delegateId: Identifier;
        start: Date;
        end: Date;
        reason?: string;
    }): Delegation;
    static rehydrate(id: Identifier, props: DelegationProps): Delegation;
    isEffectiveOn(day: Date): boolean;
    revoke(): void;
    get delegateId(): Identifier;
    snapshot(): {
        delegatorId: string;
        delegateId: string;
        start: Date;
        end: Date;
        isActive: boolean;
        reason?: string;
    };
}
export {};

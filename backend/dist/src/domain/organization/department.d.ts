import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { ExternalRef } from "./value-objects/external-ref";
interface DepartmentProps {
    parentId?: Identifier;
    unitTypeId: Identifier;
    name: LocalizedText;
    description?: LocalizedText;
    isActive: boolean;
    externalRef?: ExternalRef;
    sourceSystem: string;
    lastSyncedAt?: Date;
}
export declare class Department extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, p: {
        parentId?: Identifier;
        unitTypeId: Identifier;
        name: LocalizedText;
        description?: LocalizedText;
    }): Department;
    static fromExternal(id: Identifier, p: {
        unitTypeId: Identifier;
        name: LocalizedText;
        externalRef: ExternalRef;
        parentId?: Identifier;
        syncedAt: Date;
    }): Department;
    static rehydrate(id: Identifier, props: DepartmentProps): Department;
    rename(name: LocalizedText): void;
    describe(description?: LocalizedText): void;
    deactivate(): void;
    attachTo(parentId: Identifier): void;
    applyExternalUpdate(name: LocalizedText, syncedAt: Date, unitTypeId?: Identifier): void;
    get parentId(): Identifier | undefined;
    get isActive(): boolean;
    get unitTypeId(): Identifier;
    get externalRef(): ExternalRef | undefined;
    snapshot(): {
        parentId?: string;
        unitTypeId: string;
        name: {
            ar: string;
            en?: string;
        };
        description?: {
            ar: string;
            en?: string;
        };
        isActive: boolean;
        externalId?: string;
        sourceSystem: string;
        lastSyncedAt?: Date;
    };
}
export {};

import { AggregateRoot } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
interface RoleProps {
    name: LocalizedText;
    description?: LocalizedText;
    isSystem: boolean;
    permissionCodes: Set<string>;
    deletedAt?: Date;
}
export declare class Role extends AggregateRoot {
    private props;
    private constructor();
    static create(id: Identifier, name: LocalizedText, description?: LocalizedText): Role;
    static rehydrate(id: Identifier, props: RoleProps): Role;
    private assertMutable;
    rename(name: LocalizedText, description?: LocalizedText): void;
    grant(code: string): void;
    revoke(code: string): void;
    softDelete(at?: Date): void;
    has(code: string): boolean;
    get permissions(): string[];
    get name(): LocalizedText;
    get description(): LocalizedText | undefined;
    get isSystem(): boolean;
    get deletedAt(): Date | undefined;
    get isRetired(): boolean;
}
export {};

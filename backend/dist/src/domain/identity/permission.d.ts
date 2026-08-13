import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
interface PermissionProps {
    code: string;
    name: LocalizedText;
    description?: LocalizedText;
    groupId?: Identifier;
}
export declare class Permission extends Entity {
    private props;
    private constructor();
    static rehydrate(id: Identifier, props: PermissionProps): Permission;
    get code(): string;
    get name(): LocalizedText;
    get description(): LocalizedText | undefined;
    get groupId(): Identifier | undefined;
}
export {};

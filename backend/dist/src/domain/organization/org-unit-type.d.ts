import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { OrgUnitKind } from "./enums";
interface OrgUnitTypeProps {
    kind: OrgUnitKind;
    name: LocalizedText;
}
export declare class OrgUnitType extends Entity {
    private props;
    private constructor();
    static rehydrate(id: Identifier, props: OrgUnitTypeProps): OrgUnitType;
    get kind(): OrgUnitKind;
    get code(): string;
    get name(): LocalizedText;
}
export {};

import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
interface SensitivityLevelProps {
    name: LocalizedText;
    rank: number;
    description?: LocalizedText;
}
export declare class SensitivityLevel extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: SensitivityLevelProps): SensitivityLevel;
    static rehydrate(id: Identifier, props: SensitivityLevelProps): SensitivityLevel;
    get rank(): number;
    get name(): LocalizedText;
    isAtLeast(other: SensitivityLevel): boolean;
}
export {};

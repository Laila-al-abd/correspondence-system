import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
interface ActionTypeProps {
    code: string;
    name: LocalizedText;
    isTerminal: boolean;
}
export declare class ActionType extends Entity {
    private props;
    private constructor();
    static rehydrate(id: Identifier, props: ActionTypeProps): ActionType;
    get code(): string;
    get isTerminal(): boolean;
    get name(): LocalizedText;
}
export {};

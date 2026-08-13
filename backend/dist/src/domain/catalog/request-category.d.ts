import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
interface RequestCategoryProps {
    name: LocalizedText;
    description?: LocalizedText;
}
export declare class RequestCategory extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, name: LocalizedText, description?: LocalizedText): RequestCategory;
    static rehydrate(id: Identifier, props: RequestCategoryProps): RequestCategory;
    get name(): LocalizedText;
}
export {};

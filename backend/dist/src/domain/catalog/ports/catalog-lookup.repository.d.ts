import { Identifier } from "../../shared/identifier";
import { SensitivityLevel } from "../sensitivity-level";
import { RequestCategory } from "../request-category";
import { ActionType } from "../action-type";
export interface SensitivityLevelRepository {
    findById(id: Identifier): Promise<SensitivityLevel | null>;
    list(): Promise<SensitivityLevel[]>;
}
export interface RequestCategoryRepository {
    findById(id: Identifier): Promise<RequestCategory | null>;
    list(): Promise<RequestCategory[]>;
}
export interface ActionTypeRepository {
    findById(id: Identifier): Promise<ActionType | null>;
    findByCode(code: string): Promise<ActionType | null>;
    list(): Promise<ActionType[]>;
}

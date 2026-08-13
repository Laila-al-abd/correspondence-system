import type { SensitivityLevel as SensitivityLevelRow, RequestCategory as RequestCategoryRow, ActionType as ActionTypeRow } from '../../../generated/prisma/client';
import { SensitivityLevel } from '../../domain/catalog/sensitivity-level';
import { RequestCategory } from '../../domain/catalog/request-category';
import { ActionType } from '../../domain/catalog/action-type';
export declare const SensitivityLevelMapper: {
    toDomain(row: SensitivityLevelRow): SensitivityLevel;
};
export declare const RequestCategoryMapper: {
    toDomain(row: RequestCategoryRow): RequestCategory;
};
export declare const ActionTypeMapper: {
    toDomain(row: ActionTypeRow): ActionType;
};

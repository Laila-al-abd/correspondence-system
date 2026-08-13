import { SensitivityLevelRepository, RequestCategoryRepository, ActionTypeRepository } from '../../domain/catalog/ports/catalog-lookup.repository';
import { SensitivityLevel } from '../../domain/catalog/sensitivity-level';
import { RequestCategory } from '../../domain/catalog/request-category';
import { ActionType } from '../../domain/catalog/action-type';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaSensitivityLevelRepository implements SensitivityLevelRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<SensitivityLevel | null>;
    list(): Promise<SensitivityLevel[]>;
}
export declare class PrismaRequestCategoryRepository implements RequestCategoryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<RequestCategory | null>;
    list(): Promise<RequestCategory[]>;
}
export declare class PrismaActionTypeRepository implements ActionTypeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<ActionType | null>;
    findByCode(code: string): Promise<ActionType | null>;
    list(): Promise<ActionType[]>;
}

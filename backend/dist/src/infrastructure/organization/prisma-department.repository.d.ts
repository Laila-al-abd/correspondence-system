import { Department } from '../../domain/organization/department';
import { DepartmentRepository } from '../../domain/organization/ports/department.repository';
import { ExternalRef } from '../../domain/organization/value-objects/external-ref';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaDepartmentRepository implements DepartmentRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: Identifier): Promise<Department | null>;
    findByExternalRef(ref: ExternalRef): Promise<Department | null>;
    listBySource(source: string): Promise<Department[]>;
    findAncestorOfKind(departmentId: Identifier, kind: string): Promise<Department | null>;
    listChildren(parentId: Identifier): Promise<Department[]>;
    save(department: Department): Promise<void>;
}

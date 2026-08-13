import { ICommandHandler } from '@nestjs/cqrs';
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository';
import type { OrgUnitTypeRepository } from '../../../../domain/organization/ports/org-unit-type.repository';
import type { IdGenerator } from '../../../../domain/shared/id-generator';
import { CreateDepartmentCommand } from './create-department.command';
export interface CreateDepartmentResult {
    id: string;
    sourceSystem: string;
}
export declare class CreateDepartmentHandler implements ICommandHandler<CreateDepartmentCommand, CreateDepartmentResult> {
    private readonly departments;
    private readonly unitTypes;
    private readonly ids;
    constructor(departments: DepartmentRepository, unitTypes: OrgUnitTypeRepository, ids: IdGenerator);
    execute({ input, }: CreateDepartmentCommand): Promise<CreateDepartmentResult>;
}

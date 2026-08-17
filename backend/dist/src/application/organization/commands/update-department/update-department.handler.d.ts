import { ICommandHandler } from '@nestjs/cqrs';
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository';
import { UpdateDepartmentCommand } from './update-department.command';
export interface UpdateDepartmentResult {
    id: string;
    name: {
        ar: string;
        en?: string;
    };
}
export declare class UpdateDepartmentHandler implements ICommandHandler<UpdateDepartmentCommand, UpdateDepartmentResult> {
    private readonly departments;
    constructor(departments: DepartmentRepository);
    execute({ input, }: UpdateDepartmentCommand): Promise<UpdateDepartmentResult>;
}

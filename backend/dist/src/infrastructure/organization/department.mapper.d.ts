import { Department } from '../../domain/organization/department';
import { Prisma, Department as DepartmentRow } from '../../../generated/prisma/client';
export declare const DepartmentMapper: {
    toDomain(row: DepartmentRow): Department;
    toPersistence(department: Department): Prisma.DepartmentUncheckedCreateInput;
};

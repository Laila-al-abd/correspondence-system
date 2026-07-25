import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Department } from '../../../../domain/organization/department'
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository'
import type { OrgUnitTypeRepository } from '../../../../domain/organization/ports/org-unit-type.repository'
import type { IdGenerator } from '../../../../domain/shared/id-generator'
import { Identifier } from '../../../../domain/shared/identifier'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import {
  DEPARTMENT_REPOSITORY,
  ID_GENERATOR,
  ORG_UNIT_TYPE_REPOSITORY,
} from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { CreateDepartmentCommand } from './create-department.command'

export interface CreateDepartmentResult {
  id: string
  sourceSystem: string
}

/**
 * Creates a department by hand (sourceSystem MANUAL), the counterpart to the
 * personnel-directory sync. The org-unit type is resolved by its stable code
 * (UNIVERSITY, FACULTY, ...); a parent, when given, must already exist.
 */
@CommandHandler(CreateDepartmentCommand)
export class CreateDepartmentHandler
  implements ICommandHandler<CreateDepartmentCommand, CreateDepartmentResult>
{
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departments: DepartmentRepository,
    @Inject(ORG_UNIT_TYPE_REPOSITORY)
    private readonly unitTypes: OrgUnitTypeRepository,
    @Inject(ID_GENERATOR) private readonly ids: IdGenerator,
  ) {}

  async execute({
    input,
  }: CreateDepartmentCommand): Promise<CreateDepartmentResult> {
    const unitType = await this.unitTypes.findByCode(input.unitTypeCode)
    if (!unitType)
      throw new EntityNotFoundError('Org unit type', input.unitTypeCode)

    let parentId: Identifier | undefined
    if (input.parentId) {
      parentId = Identifier.of(input.parentId)
      if (!(await this.departments.findById(parentId)))
        throw new EntityNotFoundError('Department', input.parentId)
    }

    const department = Department.create(this.ids.next(), {
      parentId,
      unitTypeId: unitType.id,
      name: LocalizedText.create(input.name.ar, input.name.en),
      description: input.description
        ? LocalizedText.create(input.description.ar, input.description.en)
        : undefined,
    })
    await this.departments.save(department)
    return { id: department.id.toString(), sourceSystem: 'MANUAL' }
  }
}

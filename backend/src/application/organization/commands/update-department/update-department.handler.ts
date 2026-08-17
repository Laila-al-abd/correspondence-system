import { Inject } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { DepartmentRepository } from '../../../../domain/organization/ports/department.repository'
import { InvariantViolationError } from '../../../../domain/shared/domain-error'
import { Identifier } from '../../../../domain/shared/identifier'
import { LocalizedText } from '../../../../domain/shared/localized-text'
import { DEPARTMENT_REPOSITORY } from '../../../tokens'
import { EntityNotFoundError } from '../../../errors'
import { UpdateDepartmentCommand } from './update-department.command'

export interface UpdateDepartmentResult {
  id: string
  name: { ar: string; en?: string }
}

/**
 * Edits a department label: its bilingual name and description, nothing else.
 *
 * The narrowness is the point. Routing reads three things about a unit -- its
 * id (WorkflowStep.assigneeDepartmentId, UserRole.departmentId), its parent (the
 * REQUESTER_DEPARTMENT_HEAD escalation walk), and its org-unit type (the
 * REQUESTER_FACULTY_DEAN walk looks for a FACULTY-kind ancestor). It never reads
 * the name. So renaming a unit cannot change where any request goes, queued, in
 * flight or finished, and no request row stores a copy of the name that could go
 * stale.
 *
 * Re-parenting and re-typing are the two edits that would change routing, and
 * they are deliberately absent. Both are legitimate -- a section really does get
 * promoted to a faculty, and Department.applyExternalUpdate performs exactly
 * that from the sync path -- but by hand they need a cycle check on the tree and
 * an answer for requests whose remaining steps resolve through the branch being
 * moved. Until that exists, the safe subset beats a form that quietly redirects
 * work.
 *
 * Deactivation is absent for a less comfortable reason: findCandidates does not
 * consult isActive, so clearing the flag would hide the unit from the pickers
 * while work kept arriving at its desks. Offering the button before the
 * directory honours it would be worse than not offering it.
 */
@CommandHandler(UpdateDepartmentCommand)
export class UpdateDepartmentHandler
  implements ICommandHandler<UpdateDepartmentCommand, UpdateDepartmentResult>
{
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly departments: DepartmentRepository,
  ) {}

  async execute({
    input,
  }: UpdateDepartmentCommand): Promise<UpdateDepartmentResult> {
    if (!input.name && input.description === undefined)
      throw new InvariantViolationError(
        'Provide a name or a description to update.',
      )

    const id = Identifier.of(input.id)
    const department = await this.departments.findById(id)
    if (!department) throw new EntityNotFoundError('Department', input.id)

    if (input.name)
      department.rename(LocalizedText.create(input.name.ar, input.name.en))

    if (input.description !== undefined)
      department.describe(
        input.description
          ? LocalizedText.create(input.description.ar, input.description.en)
          : undefined,
      )

    await this.departments.save(department)
    return { id: id.toString(), name: department.snapshot().name }
  }
}

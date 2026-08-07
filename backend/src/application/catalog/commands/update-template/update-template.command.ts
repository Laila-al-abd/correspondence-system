import type { Priority } from '../../../../domain/request/enums'

/**
 * Every field is optional and only the ones present are applied, so a caller
 * can change one thing without restating the template. `null` on the two
 * nullable texts means "clear it"; absent means "leave it".
 */
export interface UpdateTemplateInput {
  templateId: string
  /** Only accepted while the template has no code; codes are write-once. */
  code?: string
  categoryId?: string
  sensitivityLevelId?: string
  titleAr?: string
  titleEn?: string
  descriptionAr?: string | null
  descriptionEn?: string
  defaultPriority?: Priority
  classifierDocument?: string | null
  isActive?: boolean
}

export class UpdateTemplateCommand {
  constructor(public readonly input: UpdateTemplateInput) {}
}

import type { Priority } from '../../../../domain/request/enums'
import type { TemplateFieldInput } from '../template-field.factory'

export interface CreateTemplateInput {
  /** Stable machine name (ENROLL_CERT). Optional, but write-once once given. */
  code?: string
  categoryId: string
  sensitivityLevelId: string
  titleAr: string
  titleEn?: string
  descriptionAr?: string
  descriptionEn?: string
  defaultPriority?: Priority
  /** The exact Arabic text the classifier embeds. */
  classifierDocument?: string
  /** Optional initial fields, in form order. */
  fields?: TemplateFieldInput[]
}

export class CreateTemplateCommand {
  constructor(public readonly input: CreateTemplateInput) {}
}

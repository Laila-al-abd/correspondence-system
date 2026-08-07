import { IsObject, IsOptional, IsString } from 'class-validator'

/**
 * Body of POST /requests/:id/classify/human.
 *
 * The reviewer says which template it is and fills the form in the same call.
 * The field keys are validated against that template by the handler rather than
 * here, because only the template knows them. No priority: that follows the
 * template, and a single request is re-prioritised through its own endpoint so
 * the reason is recorded.
 */
export class ClassifyByHumanDto {
  @IsString()
  templateId!: string

  @IsOptional()
  @IsObject()
  filledData?: Record<string, unknown>
}

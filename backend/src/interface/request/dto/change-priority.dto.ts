import { IsEnum, IsString, Length } from 'class-validator'
import { Priority } from '../../../domain/request/enums'

/**
 * Body of PATCH /requests/:id/priority.
 *
 * The reason is required and has a floor on its length. "urgent" typed into a
 * free-text box explains nothing, and a mandatory field that accepts one
 * character is a mandatory field in name only.
 */
export class ChangePriorityDto {
  @IsEnum(Priority)
  priority!: Priority

  @IsString()
  @Length(10, 500)
  reason!: string
}

import { IsIn, IsNumberString, IsOptional } from 'class-validator'

/**
 * Query string for GET /notifications. Values arrive as text, so the flag is
 * validated as a string and converted in the controller.
 */
export class ListNotificationsDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  unreadOnly?: string

  // Page size (1..200, default 50).
  @IsOptional()
  @IsNumberString()
  limit?: string

  // Zero-based offset.
  @IsOptional()
  @IsNumberString()
  offset?: string
}

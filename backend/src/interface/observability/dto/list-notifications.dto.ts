import { IsIn, IsOptional } from 'class-validator'

/**
 * Query string for GET /notifications. Values arrive as text, so the flag is
 * validated as a string and converted in the controller.
 */
export class ListNotificationsDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  unreadOnly?: string
}

import { IsIn, IsNumberString, IsOptional, IsString, Length } from 'class-validator'
import {
  ClassificationStatus,
  RequestStatus,
} from '../../../domain/request/enums'

/**
 * Query parameters for GET /requests/queue.
 *
 * `status` was previously read as a bare string and passed to the database
 * unchecked. Constraining it to the enum means a typo returns 400 with the
 * allowed values rather than an empty queue, which reads to staff as "there is
 * no work" -- the most misleading possible answer.
 */
export class ListQueueDto {
  @IsIn(Object.values(RequestStatus))
  status!: string

  /**
   * Narrows the queue to one classification state. Optional, so the existing
   * staff queue is unchanged when it is not sent.
   */
  @IsOptional()
  @IsIn(Object.values(ClassificationStatus))
  classificationStatus?: string

  /**
   * Sent as the strings "true" or "false", because query parameters have no
   * booleans and an unrecognised value should be a 400 rather than a
   * silently-false filter.
   */
  @IsOptional()
  @IsIn(['true', 'false'])
  hasFilledData?: string

  /**
   * The extraction backlog: `false` selects the requests the extractor has
   * never attempted. What the AI service should poll instead of
   * `hasFilledData=false`, which also returns everything it already read and
   * found nothing in.
   */
  @IsOptional()
  @IsIn(['true', 'false'])
  extracted?: string

  @IsOptional()
  @IsNumberString()
  limit?: string

  @IsOptional()
  @IsString()
  @Length(1, 512)
  cursor?: string
}

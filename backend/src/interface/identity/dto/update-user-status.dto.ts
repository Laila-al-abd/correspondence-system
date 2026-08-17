import { IsIn, IsString } from 'class-validator'

/** Body for PATCH /users/:userId/status. */
export class UpdateUserStatusDto {
  @IsString()
  @IsIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'], {
    message: 'status must be ACTIVE, SUSPENDED, or INACTIVE.',
  })
  status!: string
}

import { IsString, Length } from 'class-validator'

/** Body for POST /roles/:roleId/permissions. */
export class GrantPermissionDto {
  // One of the codes returned by GET /roles/permissions, e.g. "request.act".
  @IsString()
  @Length(1, 100)
  code!: string
}

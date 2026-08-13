import { IsDefined, IsOptional, IsString, MaxLength } from 'class-validator'

/**
 * Body for PUT /settings/:key.
 *
 * `value` is deliberately untyped here. Each setting is a different JSON
 * document, so a DTO cannot describe them all; what it can do is insist that a
 * value was actually sent, so an empty body can never blank a live setting.
 * The real check is the per-key validator in the application layer, which knows
 * what that particular setting means.
 */
export class UpdateSettingDto {
  @IsDefined({ message: 'Provide a "value" for the setting.' })
  value!: unknown

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string
}

import { IsDefined, IsString } from 'class-validator'

/**
 * Body for PUT /users/:userId/attributes. The value's concrete type is checked
 * in the handler against the attribute definition's declared data type.
 */
export class SetUserAttributeDto {
  @IsString()
  attributeCode!: string

  @IsDefined()
  value!: string | number | boolean
}

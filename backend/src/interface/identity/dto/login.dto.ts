import { IsEmail, IsOptional, IsString } from 'class-validator'

export class LoginDto {
  // Which auth provider to use. Defaults to LOCAL in the controller.
  @IsOptional()
  @IsString()
  method?: string

  @IsEmail()
  email!: string

  @IsString()
  password!: string
}

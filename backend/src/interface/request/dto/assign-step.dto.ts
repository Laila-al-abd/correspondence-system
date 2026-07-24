import { IsString } from 'class-validator'

export class AssignStepDto {
  @IsString()
  assigneeUserId!: string
}

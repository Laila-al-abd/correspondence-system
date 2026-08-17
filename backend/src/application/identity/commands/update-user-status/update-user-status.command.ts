export interface UpdateUserStatusInput {
  userId: string
  status: string
}

export class UpdateUserStatusCommand {
  constructor(public readonly input: UpdateUserStatusInput) {}
}

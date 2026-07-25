export interface SetUserAttributeInput {
  userId: string
  attributeCode: string
  value: unknown
}

export class SetUserAttributeCommand {
  constructor(public readonly input: SetUserAttributeInput) {}
}

export interface ClearUserAttributeInput {
  userId: string
  attributeCode: string
}

export class ClearUserAttributeCommand {
  constructor(public readonly input: ClearUserAttributeInput) {}
}

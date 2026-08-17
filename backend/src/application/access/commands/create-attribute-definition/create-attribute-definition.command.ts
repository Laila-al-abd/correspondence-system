export interface CreateAttributeOptionInput {
  value: string
  labelAr: string
  labelEn?: string
  ordinal?: number
}

export interface CreateAttributeDefinitionInput {
  code: string
  labelAr: string
  labelEn?: string
  dataType: string
  descriptionAr?: string
  descriptionEn?: string
  /** Required (>=1) for ENUM, rejected for every other data type. */
  options?: CreateAttributeOptionInput[]
}

export class CreateAttributeDefinitionCommand {
  constructor(public readonly input: CreateAttributeDefinitionInput) {}
}

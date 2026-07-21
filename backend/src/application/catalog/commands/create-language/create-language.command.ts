export interface CreateLanguageInput {
  code: string
  name: string
  nativeName: string
  isEnabled?: boolean
  isDefault?: boolean
}

export class CreateLanguageCommand {
  constructor(public readonly input: CreateLanguageInput) {}
}

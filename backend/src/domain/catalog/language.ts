import { Guard } from '../shared/guard'

/**
 * Catalog is a SIMPLE context (see ADR 0001): reference data with almost no
 * invariants. So `Language` is a lightweight model — it does NOT extend
 * AggregateRoot and carries no domain events. It still validates its own
 * required fields on `create`, but that's the extent of the "behaviour".
 */
export interface LanguageProps {
  code: string
  name: string
  nativeName: string
  isEnabled: boolean
  isDefault: boolean
}

export class Language {
  private constructor(private readonly props: LanguageProps) {}

  static create(input: {
    code: string
    name: string
    nativeName: string
    isEnabled?: boolean
    isDefault?: boolean
  }): Language {
    return new Language({
      code: Guard.againstEmpty(input.code, 'code').toLowerCase(),
      name: Guard.againstEmpty(input.name, 'name'),
      nativeName: Guard.againstEmpty(input.nativeName, 'nativeName'),
      isEnabled: input.isEnabled ?? true,
      isDefault: input.isDefault ?? false,
    })
  }

  static rehydrate(props: LanguageProps): Language {
    return new Language(props)
  }

  get code(): string {
    return this.props.code
  }
  get name(): string {
    return this.props.name
  }
  get nativeName(): string {
    return this.props.nativeName
  }
  get isEnabled(): boolean {
    return this.props.isEnabled
  }
  get isDefault(): boolean {
    return this.props.isDefault
  }

  toJSON(): LanguageProps {
    return { ...this.props }
  }
}

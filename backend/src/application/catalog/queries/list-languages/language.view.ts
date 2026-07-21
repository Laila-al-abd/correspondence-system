/** Read model returned to callers of the Catalog queries. */
export interface LanguageView {
  code: string
  name: string
  nativeName: string
  isEnabled: boolean
  isDefault: boolean
}

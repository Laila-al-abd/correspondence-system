/** Read model returned to callers of the Catalog queries for action types. */
export interface ActionTypeView {
  id: string
  code: string
  name: { ar: string; en?: string }
  isTerminal: boolean
}
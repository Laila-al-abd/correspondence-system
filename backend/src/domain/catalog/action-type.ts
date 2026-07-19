import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { LocalizedText } from "../shared/localized-text"

interface ActionTypeProps {
  code: string
  name: LocalizedText
  isTerminal: boolean
}

/**
 * A kind of action a reviewer can take on a step (APPROVE, REJECT, FORWARD, …).
 * Modeled as data (not a native enum) so new action types stay configurable.
 * `isTerminal` marks actions that end a request's journey (e.g. REJECT, SIGN).
 */
export class ActionType extends Entity {
  private constructor(id: Identifier, private props: ActionTypeProps) {
    super(id)
  }

  static rehydrate(id: Identifier, props: ActionTypeProps): ActionType {
    return new ActionType(id, props)
  }

  get code(): string { return this.props.code }
  get isTerminal(): boolean { return this.props.isTerminal }
}

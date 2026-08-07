import { Entity } from "../shared/entity"
import { Identifier } from "../shared/identifier"

interface RequestActionProps {
  /**
   * The request this decision was taken on.
   *
   * Held by the entity rather than handed to the repository alongside it. The
   * column was always there; what was missing was the entity knowing its own
   * value -- so every caller had to remember to supply it, and a rehydrated
   * action could not say which request it belonged to at all.
   */
  requestId: Identifier
  requestStepInstanceId?: Identifier
  actorId: Identifier
  actionTypeId: Identifier
  comment?: string
  createdAt: Date
}

export interface RequestActionSnapshot {
  requestId: string
  requestStepInstanceId?: string
  actorId: string
  actionTypeId: string
  comment?: string
  createdAt: Date
}

/** An immutable record of a decision an actor took on a request or step. */
export class RequestAction extends Entity {
  private constructor(id: Identifier, private props: RequestActionProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: {
      requestId: Identifier
      actorId: Identifier
      actionTypeId: Identifier
      requestStepInstanceId?: Identifier
      comment?: string
    },
  ): RequestAction {
    return new RequestAction(id, { ...p, createdAt: new Date() })
  }

  static rehydrate(id: Identifier, props: RequestActionProps): RequestAction {
    return new RequestAction(id, props)
  }

  get requestId(): Identifier { return this.props.requestId }
  get actorId(): Identifier { return this.props.actorId }
  get actionTypeId(): Identifier { return this.props.actionTypeId }
  get requestStepInstanceId(): Identifier | undefined { return this.props.requestStepInstanceId }

  snapshot(): RequestActionSnapshot {
    return {
      requestId: this.props.requestId.toString(),
      requestStepInstanceId: this.props.requestStepInstanceId?.toString(),
      actorId: this.props.actorId.toString(),
      actionTypeId: this.props.actionTypeId.toString(),
      comment: this.props.comment,
      createdAt: this.props.createdAt,
    }
  }
}

import { AggregateRoot } from "../shared/entity"
import { Identifier } from "../shared/identifier"
import { Guard } from "../shared/guard"

interface NotificationProps {
  userId: Identifier
  requestId?: Identifier
  type: string
  title: string
  body?: string
  isRead: boolean
  createdAt: Date
}

/** An in-app message to a user, optionally about a specific request. */
export class Notification extends AggregateRoot {
  private constructor(id: Identifier, private props: NotificationProps) {
    super(id)
  }

  static create(
    id: Identifier,
    p: { userId: Identifier; type: string; title: string; body?: string; requestId?: Identifier },
  ): Notification {
    Guard.againstEmpty(p.title, "title")
    Guard.againstEmpty(p.type, "type")
    return new Notification(id, { ...p, isRead: false, createdAt: new Date() })
  }

  static rehydrate(id: Identifier, props: NotificationProps): Notification {
    return new Notification(id, props)
  }

  snapshot(): {
    userId: string
    requestId?: string
    type: string
    title: string
    body?: string
    isRead: boolean
    createdAt: Date
  } {
    return {
      userId: this.props.userId.toString(),
      requestId: this.props.requestId?.toString(),
      type: this.props.type,
      title: this.props.title,
      body: this.props.body,
      isRead: this.props.isRead,
      createdAt: this.props.createdAt,
    }
  }

  markRead(): void { this.props.isRead = true }

  get isRead(): boolean { return this.props.isRead }
  get userId(): Identifier { return this.props.userId }
}

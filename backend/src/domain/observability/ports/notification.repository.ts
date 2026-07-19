import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Notification } from "../notification"

export interface NotificationRepository extends Repository<Notification> {
  listForUser(userId: Identifier, onlyUnread?: boolean): Promise<Notification[]>
  markAllRead(userId: Identifier): Promise<void>
}

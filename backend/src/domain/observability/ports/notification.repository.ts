import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Notification } from "../notification"

export interface NotificationRepository extends Repository<Notification> {
  listForUser(userId: Identifier, onlyUnread?: boolean): Promise<Notification[]>
  countUnread(userId: Identifier): Promise<number>
  markAllRead(userId: Identifier): Promise<void>
  /** Removes notifications created strictly before `cutoff`; returns the row count. */
  deleteOlderThan(cutoff: Date): Promise<number>
}

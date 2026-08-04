import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Notification } from "../notification"

export interface NotificationRepository extends Repository<Notification> {
  listForUser(userId: Identifier, onlyUnread?: boolean): Promise<Notification[]>
  /**
   * One page of a user's inbox, newest first, plus the unfiltered total.
   *
   * Separate from listForUser rather than replacing it: the background jobs
   * that call listForUser want every row and would have to be taught to page,
   * while the inbox screen wants twenty. Keeping both makes each caller say
   * what it means.
   */
  pageForUser(
    userId: Identifier,
    options: { onlyUnread?: boolean; limit: number; offset: number },
  ): Promise<{ rows: Notification[]; total: number }>
  countUnread(userId: Identifier): Promise<number>
  markAllRead(userId: Identifier): Promise<void>
  /** Removes notifications created strictly before `cutoff`; returns the row count. */
  deleteOlderThan(cutoff: Date): Promise<number>
  /**
   * Whether this user already holds a notification of `type` about `requestId`.
   * Lets a repeated background alert stay silent instead of duplicating itself.
   */
  existsFor(
    userId: Identifier,
    requestId: Identifier,
    type: string,
  ): Promise<boolean>
}

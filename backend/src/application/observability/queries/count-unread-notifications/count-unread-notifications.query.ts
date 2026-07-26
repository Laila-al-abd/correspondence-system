/** Unread count for the caller, used by the bell badge in the UI. */
export class CountUnreadNotificationsQuery {
  constructor(readonly userId: string) {}
}

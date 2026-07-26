/**
 * Deletes notifications older than `retentionDays`. Used by the nightly
 * retention job and by the admin endpoint that triggers a sweep on demand.
 */
export class PurgeOldNotificationsCommand {
  constructor(readonly retentionDays: number) {}
}

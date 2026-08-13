/**
 * Replaces the value of one administrable system setting.
 *
 * PUT semantics, not PATCH: the value is a whole JSON document (a working-hours
 * policy, a numbering scheme) whose fields interact -- start against end, days
 * against the schedule -- so it can only be validated as a whole.
 *
 * `userId` is the authenticated caller and is stored on the row, because
 * "who changed the university's working hours" is exactly the kind of change
 * somebody will later need to trace.
 */
export class UpdateSettingCommand {
  constructor(
    readonly key: string,
    readonly value: unknown,
    readonly userId: string,
    readonly description?: string,
  ) {}
}

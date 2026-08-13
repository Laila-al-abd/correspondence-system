/**
 * Reads one administrable system setting. The key is the public identifier
 * (e.g. `working_hours`), not the row id, because that is what an
 * administrator and the code that consumes the setting both know it by.
 */
export class GetSettingQuery {
  constructor(readonly key: string) {}
}

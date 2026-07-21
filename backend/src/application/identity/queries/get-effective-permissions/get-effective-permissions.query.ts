/** Asks for every permission code a user effectively holds. */
export class GetEffectivePermissionsQuery {
  constructor(public readonly userId: string) {}
}

export class AuthenticateUserCommand {
  constructor(
    public readonly method: string,
    public readonly credentials: Record<string, unknown>,
  ) {}
}

export declare class AuthenticateUserCommand {
    readonly method: string;
    readonly credentials: Record<string, unknown>;
    constructor(method: string, credentials: Record<string, unknown>);
}

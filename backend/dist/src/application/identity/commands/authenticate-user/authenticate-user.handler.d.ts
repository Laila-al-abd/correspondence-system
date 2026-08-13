import { ICommandHandler } from '@nestjs/cqrs';
import type { AuthProviderRegistry } from '../../../../domain/identity/ports/auth-provider-registry';
import type { AccessTokenService } from '../../../../domain/identity/ports/access-token.service';
import { AuthenticateUserCommand } from './authenticate-user.command';
export interface AuthenticationResult {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: {
        id: string;
        email: string;
    };
}
export declare class AuthenticateUserHandler implements ICommandHandler<AuthenticateUserCommand, AuthenticationResult> {
    private readonly registry;
    private readonly tokens;
    constructor(registry: AuthProviderRegistry, tokens: AccessTokenService);
    execute(command: AuthenticateUserCommand): Promise<AuthenticationResult>;
}

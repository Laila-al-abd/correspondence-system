import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AccessTokenService } from '../../domain/identity/ports/access-token.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly tokens;
    constructor(reflector: Reflector, tokens: AccessTokenService);
    canActivate(context: ExecutionContext): boolean;
}

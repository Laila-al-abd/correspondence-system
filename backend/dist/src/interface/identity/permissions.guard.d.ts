import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RoleRepository } from '../../domain/identity/ports/role.repository';
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly roles;
    constructor(reflector: Reflector, roles: RoleRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

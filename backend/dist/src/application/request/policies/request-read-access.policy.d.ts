import type { RoleRepository } from '../../../domain/identity/ports/role.repository';
export declare class RequestReadAccessPolicy {
    private readonly roles;
    constructor(roles: RoleRepository);
    assertMayRead(callerId: string, requesterId: string): Promise<void>;
}

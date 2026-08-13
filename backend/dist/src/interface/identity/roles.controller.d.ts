import { CommandBus } from '@nestjs/cqrs';
import type { PermissionGroupView, RoleDetailView, RoleQueryPort, RoleSummaryView } from '../../application/identity/ports/role-query.port';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { GrantPermissionDto } from './dto/grant-permission.dto';
export declare class RolesController {
    private readonly commandBus;
    private readonly roles;
    constructor(commandBus: CommandBus, roles: RoleQueryPort);
    list(): Promise<RoleSummaryView[]>;
    permissions(): Promise<PermissionGroupView[]>;
    getOne(roleId: string): Promise<RoleDetailView>;
    create(dto: CreateRoleDto, actorId: string): Promise<any>;
    update(roleId: string, dto: UpdateRoleDto): Promise<any>;
    remove(roleId: string): Promise<any>;
    grant(roleId: string, dto: GrantPermissionDto): Promise<any>;
    revoke(roleId: string, code: string): Promise<any>;
}

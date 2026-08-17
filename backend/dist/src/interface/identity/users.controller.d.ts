import { CommandBus } from '@nestjs/cqrs';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SetUserAttributeDto } from './dto/set-user-attribute.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import type { ListUsersResult, UserDetailView, UserQueryPort } from '../../application/identity/ports/user-query.port';
export declare class UsersController {
    private readonly commandBus;
    private readonly users;
    constructor(commandBus: CommandBus, users: UserQueryPort);
    list(dto: ListUsersDto): Promise<ListUsersResult>;
    getOne(userId: string): Promise<UserDetailView>;
    create(dto: CreateUserDto, actorId: string): Promise<any>;
    syncFromDirectory(source?: string): Promise<any>;
    assignRole(userId: string, dto: AssignRoleDto, actorId: string): Promise<any>;
    revokeRole(userId: string, roleId: string, departmentId?: string): Promise<any>;
    updateStatus(userId: string, dto: UpdateUserStatusDto): Promise<any>;
    setAttribute(userId: string, dto: SetUserAttributeDto): Promise<any>;
    clearAttribute(userId: string, attributeCode: string): Promise<any>;
}

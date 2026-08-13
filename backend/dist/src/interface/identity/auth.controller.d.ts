import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    register(dto: RegisterUserDto): Promise<{
        status: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<any>;
    myPermissions(userId: string): Promise<any>;
    adminPing(): {
        status: string;
        message: string;
    };
}

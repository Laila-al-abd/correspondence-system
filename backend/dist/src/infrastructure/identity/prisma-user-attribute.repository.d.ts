import { UserAttributeRepository } from '../../domain/identity/ports/user-attribute.repository';
import { UserAttribute } from '../../domain/identity/user-attribute';
import { Identifier } from '../../domain/shared/identifier';
import { PrismaService } from '../persistence/prisma.service';
export declare class PrismaUserAttributeRepository implements UserAttributeRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForUser(userId: Identifier): Promise<UserAttribute[]>;
    setValue(params: {
        userId: Identifier;
        attributeId: Identifier;
        value: unknown;
    }): Promise<void>;
    clear(params: {
        userId: Identifier;
        attributeId: Identifier;
    }): Promise<void>;
}

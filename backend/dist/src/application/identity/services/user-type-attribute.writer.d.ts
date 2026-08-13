import type { AttributeDefinitionRepository } from '../../../domain/catalog/ports/attribute-definition.repository';
import type { UserAttributeRepository } from '../../../domain/identity/ports/user-attribute.repository';
import { Identifier } from '../../../domain/shared/identifier';
export declare const USER_TYPE_ATTRIBUTE_CODE = "user_type";
export declare class UserTypeAttributeWriter {
    private readonly attributes;
    private readonly userAttributes;
    private readonly logger;
    constructor(attributes: AttributeDefinitionRepository, userAttributes: UserAttributeRepository);
    write(userId: Identifier, userType: string): Promise<void>;
}

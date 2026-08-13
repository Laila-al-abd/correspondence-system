"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserAttributeRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const user_attribute_mapper_1 = require("./user-attribute.mapper");
let PrismaUserAttributeRepository = class PrismaUserAttributeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForUser(userId) {
        const rows = await this.prisma.userAttribute.findMany({
            where: { userId: userId.toString() },
            orderBy: { attributeId: 'asc' },
        });
        return rows.map((row) => user_attribute_mapper_1.UserAttributeMapper.toDomain(row));
    }
    async setValue(params) {
        const userId = params.userId.toString();
        const attributeId = params.attributeId.toString();
        const value = params.value;
        await this.prisma.userAttribute.upsert({
            where: { userId_attributeId: { userId, attributeId } },
            update: { value },
            create: { userId, attributeId, value },
        });
    }
    async clear(params) {
        await this.prisma.userAttribute.deleteMany({
            where: {
                userId: params.userId.toString(),
                attributeId: params.attributeId.toString(),
            },
        });
    }
};
exports.PrismaUserAttributeRepository = PrismaUserAttributeRepository;
exports.PrismaUserAttributeRepository = PrismaUserAttributeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserAttributeRepository);
//# sourceMappingURL=prisma-user-attribute.repository.js.map
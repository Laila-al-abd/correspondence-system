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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const user_mapper_1 = require("./user.mapper");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.user.findFirst({
            where: { id: id.toString(), deletedAt: null },
        });
        return row ? user_mapper_1.UserMapper.toDomain(row) : null;
    }
    async findByEmail(email) {
        const row = await this.prisma.user.findFirst({
            where: { email: email.value, deletedAt: null },
        });
        return row ? user_mapper_1.UserMapper.toDomain(row) : null;
    }
    async findByInstitutionalNumber(n) {
        const row = await this.prisma.user.findFirst({
            where: { institutionalNumber: n.value, deletedAt: null },
        });
        return row ? user_mapper_1.UserMapper.toDomain(row) : null;
    }
    async save(user) {
        const data = user_mapper_1.UserMapper.toPersistence(user);
        await this.prisma.user.upsert({
            where: { id: user.id.toString() },
            create: data,
            update: data,
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map
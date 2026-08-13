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
exports.PrismaActionTypeRepository = exports.PrismaRequestCategoryRepository = exports.PrismaSensitivityLevelRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const catalog_lookup_mapper_1 = require("./catalog-lookup.mapper");
let PrismaSensitivityLevelRepository = class PrismaSensitivityLevelRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.sensitivityLevel.findFirst({
            where: { id: id.toString(), deletedAt: null },
        });
        return row ? catalog_lookup_mapper_1.SensitivityLevelMapper.toDomain(row) : null;
    }
    async list() {
        const rows = await this.prisma.sensitivityLevel.findMany({
            where: { deletedAt: null },
            orderBy: { rank: 'asc' },
        });
        return rows.map((row) => catalog_lookup_mapper_1.SensitivityLevelMapper.toDomain(row));
    }
};
exports.PrismaSensitivityLevelRepository = PrismaSensitivityLevelRepository;
exports.PrismaSensitivityLevelRepository = PrismaSensitivityLevelRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSensitivityLevelRepository);
let PrismaRequestCategoryRepository = class PrismaRequestCategoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.requestCategory.findFirst({
            where: { id: id.toString(), deletedAt: null },
        });
        return row ? catalog_lookup_mapper_1.RequestCategoryMapper.toDomain(row) : null;
    }
    async list() {
        const rows = await this.prisma.requestCategory.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => catalog_lookup_mapper_1.RequestCategoryMapper.toDomain(row));
    }
};
exports.PrismaRequestCategoryRepository = PrismaRequestCategoryRepository;
exports.PrismaRequestCategoryRepository = PrismaRequestCategoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRequestCategoryRepository);
let PrismaActionTypeRepository = class PrismaActionTypeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.actionType.findFirst({
            where: { id: id.toString(), deletedAt: null },
        });
        return row ? catalog_lookup_mapper_1.ActionTypeMapper.toDomain(row) : null;
    }
    async findByCode(code) {
        const row = await this.prisma.actionType.findFirst({
            where: { code, deletedAt: null },
        });
        return row ? catalog_lookup_mapper_1.ActionTypeMapper.toDomain(row) : null;
    }
    async list() {
        const rows = await this.prisma.actionType.findMany({
            where: { deletedAt: null },
            orderBy: { code: 'asc' },
        });
        return rows.map((row) => catalog_lookup_mapper_1.ActionTypeMapper.toDomain(row));
    }
};
exports.PrismaActionTypeRepository = PrismaActionTypeRepository;
exports.PrismaActionTypeRepository = PrismaActionTypeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaActionTypeRepository);
//# sourceMappingURL=prisma-catalog-lookup.repository.js.map
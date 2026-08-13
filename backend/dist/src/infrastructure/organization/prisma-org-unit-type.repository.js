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
exports.PrismaOrgUnitTypeRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const org_unit_type_mapper_1 = require("./org-unit-type.mapper");
let PrismaOrgUnitTypeRepository = class PrismaOrgUnitTypeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByCode(code) {
        const row = await this.prisma.orgUnitType.findFirst({
            where: { code, deletedAt: null },
        });
        return row ? org_unit_type_mapper_1.OrgUnitTypeMapper.toDomain(row) : null;
    }
    async list() {
        const rows = await this.prisma.orgUnitType.findMany({
            where: { deletedAt: null },
            orderBy: { code: 'asc' },
        });
        return rows.map((row) => org_unit_type_mapper_1.OrgUnitTypeMapper.toDomain(row));
    }
};
exports.PrismaOrgUnitTypeRepository = PrismaOrgUnitTypeRepository;
exports.PrismaOrgUnitTypeRepository = PrismaOrgUnitTypeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaOrgUnitTypeRepository);
//# sourceMappingURL=prisma-org-unit-type.repository.js.map
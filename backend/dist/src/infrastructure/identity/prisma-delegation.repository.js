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
exports.PrismaDelegationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const delegation_mapper_1 = require("./delegation.mapper");
let PrismaDelegationRepository = class PrismaDelegationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.delegation.findFirst({
            where: { id: id.toString(), deletedAt: null },
        });
        return row ? delegation_mapper_1.DelegationMapper.toDomain(row) : null;
    }
    async save(delegation) {
        const data = delegation_mapper_1.DelegationMapper.toPersistence(delegation);
        await this.prisma.delegation.upsert({
            where: { id: delegation.id.toString() },
            create: data,
            update: data,
        });
    }
    async activeToDelegate(delegateId, on) {
        const row = await this.prisma.delegation.findFirst({
            where: {
                delegateId: delegateId.toString(),
                isActive: true,
                deletedAt: null,
                startDate: { lte: on },
                endDate: { gte: on },
            },
            orderBy: { startDate: 'desc' },
        });
        return row ? delegation_mapper_1.DelegationMapper.toDomain(row) : null;
    }
    async activeFor(delegatorId, on) {
        const row = await this.prisma.delegation.findFirst({
            where: {
                delegatorId: delegatorId.toString(),
                isActive: true,
                deletedAt: null,
                startDate: { lte: on },
                endDate: { gte: on },
            },
            orderBy: { startDate: 'desc' },
        });
        return row ? delegation_mapper_1.DelegationMapper.toDomain(row) : null;
    }
};
exports.PrismaDelegationRepository = PrismaDelegationRepository;
exports.PrismaDelegationRepository = PrismaDelegationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDelegationRepository);
//# sourceMappingURL=prisma-delegation.repository.js.map
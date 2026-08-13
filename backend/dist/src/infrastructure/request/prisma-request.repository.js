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
exports.PrismaRequestRepository = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../application/errors");
const prisma_service_1 = require("../persistence/prisma.service");
const prisma_transaction_runner_1 = require("../persistence/prisma-transaction-runner");
const transaction_context_1 = require("../persistence/transaction-context");
const request_mapper_1 = require("./request.mapper");
let PrismaRequestRepository = class PrismaRequestRepository {
    prisma;
    transactions;
    constructor(prisma, transactions) {
        this.prisma = prisma;
        this.transactions = transactions;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async findById(id) {
        const row = await this.db.request.findFirst({
            where: { id: id.toString() },
            include: request_mapper_1.requestInclude,
        });
        return row ? request_mapper_1.RequestMapper.toDomain(row) : null;
    }
    async findByReferenceNo(referenceNo) {
        const row = await this.db.request.findFirst({
            where: { referenceNo },
            include: request_mapper_1.requestInclude,
        });
        return row ? request_mapper_1.RequestMapper.toDomain(row) : null;
    }
    async listByRequester(requesterId) {
        const rows = await this.db.request.findMany({
            where: { requesterId: requesterId.toString() },
            include: request_mapper_1.requestInclude,
            orderBy: { id: 'desc' },
        });
        return rows.map((row) => request_mapper_1.RequestMapper.toDomain(row));
    }
    async listAssignedTo(userId) {
        const rows = await this.db.request.findMany({
            where: {
                stepInstances: {
                    some: { assignedToUserId: userId.toString() },
                },
            },
            include: request_mapper_1.requestInclude,
            orderBy: { id: 'desc' },
        });
        return rows.map((row) => request_mapper_1.RequestMapper.toDomain(row));
    }
    async listByStatus(status) {
        const rows = await this.db.request.findMany({
            where: { currentStatus: status },
            include: request_mapper_1.requestInclude,
            orderBy: { id: 'desc' },
        });
        return rows.map((row) => request_mapper_1.RequestMapper.toDomain(row));
    }
    async save(request) {
        const id = request.id.toString();
        const root = request_mapper_1.RequestMapper.toRoot(request);
        const stepInstances = request.snapshot().stepInstances;
        const expectedVersion = request.version;
        const update = {
            ...root,
            version: { increment: 1 },
        };
        await this.transactions.run(async () => {
            const db = this.db;
            const written = await db.request.updateMany({
                where: { id, version: expectedVersion },
                data: update,
            });
            if (written.count === 0) {
                const existing = await db.request.findUnique({
                    where: { id },
                    select: { id: true },
                });
                if (existing)
                    throw new errors_1.ConcurrentModificationError('request', id);
                await db.request.create({ data: root });
            }
            for (const si of stepInstances) {
                const data = request_mapper_1.RequestMapper.toStepInstanceRow(si);
                await db.requestStepInstance.upsert({
                    where: { id: si.id },
                    create: data,
                    update: data,
                });
            }
        });
    }
};
exports.PrismaRequestRepository = PrismaRequestRepository;
exports.PrismaRequestRepository = PrismaRequestRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        prisma_transaction_runner_1.PrismaTransactionRunner])
], PrismaRequestRepository);
//# sourceMappingURL=prisma-request.repository.js.map
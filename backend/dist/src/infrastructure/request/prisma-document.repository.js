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
exports.PrismaDocumentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const document_mapper_1 = require("./document.mapper");
let PrismaDocumentRepository = class PrismaDocumentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async findById(id) {
        const row = await this.db.document.findFirst({
            where: { id: id.toString() },
        });
        return row ? document_mapper_1.DocumentMapper.toDomain(row) : null;
    }
    async save(document) {
        const data = document_mapper_1.DocumentMapper.toPersistence(document);
        await this.db.document.upsert({
            where: { id: document.id.toString() },
            create: data,
            update: data,
        });
    }
    async findExistingStorageKeys(keys) {
        if (keys.length === 0)
            return new Set();
        const rows = await this.db.document.findMany({
            where: { storageKey: { in: keys } },
            select: { storageKey: true },
        });
        return new Set(rows.map((row) => row.storageKey));
    }
    async listByRequest(requestId) {
        const rows = await this.db.document.findMany({
            where: { requestId: requestId.toString() },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => document_mapper_1.DocumentMapper.toDomain(row));
    }
};
exports.PrismaDocumentRepository = PrismaDocumentRepository;
exports.PrismaDocumentRepository = PrismaDocumentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDocumentRepository);
//# sourceMappingURL=prisma-document.repository.js.map
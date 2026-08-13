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
exports.PrismaPaymentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const payment_mapper_1 = require("./payment.mapper");
let PrismaPaymentRepository = class PrismaPaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async findById(id) {
        const row = await this.db.payment.findFirst({
            where: { id: id.toString() },
        });
        return row ? payment_mapper_1.PaymentMapper.toDomain(row) : null;
    }
    async listByRequest(requestId) {
        const rows = await this.db.payment.findMany({
            where: { requestId: requestId.toString() },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => payment_mapper_1.PaymentMapper.toDomain(row));
    }
    async save(payment) {
        const data = payment_mapper_1.PaymentMapper.toPersistence(payment);
        await this.db.payment.upsert({
            where: { id: payment.id.toString() },
            create: data,
            update: data,
        });
    }
};
exports.PrismaPaymentRepository = PrismaPaymentRepository;
exports.PrismaPaymentRepository = PrismaPaymentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaPaymentRepository);
//# sourceMappingURL=prisma-payment.repository.js.map
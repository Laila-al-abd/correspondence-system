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
exports.PrismaSlaScan = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const OPEN_STATUSES = ['PENDING', 'IN_PROGRESS', 'WAITING'];
let PrismaSlaScan = class PrismaSlaScan {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOpenStepsWithDeadline(limit) {
        const rows = await this.prisma.requestStepInstance.findMany({
            where: {
                status: { in: OPEN_STATUSES },
                slaPaused: false,
                slaDueAt: { not: null },
            },
            select: { id: true, requestId: true, slaDueAt: true },
            orderBy: { slaDueAt: 'asc' },
            take: limit,
        });
        const open = [];
        for (const row of rows) {
            if (row.slaDueAt === null)
                continue;
            open.push({
                requestId: row.requestId.toString(),
                stepInstanceId: row.id.toString(),
                slaDueAt: row.slaDueAt,
            });
        }
        return open;
    }
};
exports.PrismaSlaScan = PrismaSlaScan;
exports.PrismaSlaScan = PrismaSlaScan = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSlaScan);
//# sourceMappingURL=prisma-sla-scan.js.map
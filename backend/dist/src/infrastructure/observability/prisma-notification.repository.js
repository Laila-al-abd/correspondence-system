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
exports.PrismaNotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const transaction_context_1 = require("../persistence/transaction-context");
const notification_mapper_1 = require("./notification.mapper");
let PrismaNotificationRepository = class PrismaNotificationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    get db() {
        return (0, transaction_context_1.dbClient)(this.prisma);
    }
    async findById(id) {
        const row = await this.db.notification.findFirst({
            where: { id: id.toString() },
        });
        return row ? notification_mapper_1.NotificationMapper.toDomain(row) : null;
    }
    async listForUser(userId, onlyUnread = false) {
        const rows = await this.db.notification.findMany({
            where: {
                userId: userId.toString(),
                ...(onlyUnread ? { isRead: false } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((row) => notification_mapper_1.NotificationMapper.toDomain(row));
    }
    async pageForUser(userId, options) {
        const where = {
            userId: userId.toString(),
            ...(options.onlyUnread ? { isRead: false } : {}),
        };
        const [total, rows] = await Promise.all([
            this.db.notification.count({ where }),
            this.db.notification.findMany({
                where,
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                skip: options.offset,
                take: options.limit,
            }),
        ]);
        return { rows: rows.map((row) => notification_mapper_1.NotificationMapper.toDomain(row)), total };
    }
    async countUnread(userId) {
        return this.db.notification.count({
            where: { userId: userId.toString(), isRead: false },
        });
    }
    async markAllRead(userId) {
        await this.db.notification.updateMany({
            where: { userId: userId.toString(), isRead: false },
            data: { isRead: true },
        });
    }
    async deleteOlderThan(cutoff) {
        const { count } = await this.db.notification.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });
        return count;
    }
    async existsFor(userId, requestId, type) {
        const found = await this.db.notification.findFirst({
            where: {
                userId: userId.toString(),
                requestId: requestId.toString(),
                type,
            },
            select: { id: true },
        });
        return found !== null;
    }
    async save(notification) {
        const data = notification_mapper_1.NotificationMapper.toPersistence(notification);
        await this.db.notification.upsert({
            where: { id: notification.id.toString() },
            create: data,
            update: data,
        });
    }
};
exports.PrismaNotificationRepository = PrismaNotificationRepository;
exports.PrismaNotificationRepository = PrismaNotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaNotificationRepository);
//# sourceMappingURL=prisma-notification.repository.js.map
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
exports.PrismaNotificationAudience = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const role_access_where_1 = require("../identity/role-access.where");
let PrismaNotificationAudience = class PrismaNotificationAudience {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserIdsWithPermission(permissionCode) {
        const rows = await this.prisma.userRole.findMany({
            where: {
                ...(0, role_access_where_1.activeRoleAssignment)(new Date()),
                role: {
                    deletedAt: null,
                    permissions: { some: { permission: { code: permissionCode } } },
                },
            },
            select: { userId: true },
            distinct: ['userId'],
        });
        return rows.map((row) => row.userId.toString());
    }
};
exports.PrismaNotificationAudience = PrismaNotificationAudience;
exports.PrismaNotificationAudience = PrismaNotificationAudience = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaNotificationAudience);
//# sourceMappingURL=prisma-notification-audience.js.map
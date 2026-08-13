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
exports.PrismaSystemSettingRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const system_setting_mapper_1 = require("./system-setting.mapper");
let PrismaSystemSettingRepository = class PrismaSystemSettingRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.systemSetting.findFirst({
            where: { id: id.toString() },
        });
        return row ? system_setting_mapper_1.SystemSettingMapper.toDomain(row) : null;
    }
    async findByKey(key) {
        const row = await this.prisma.systemSetting.findFirst({ where: { key } });
        return row ? system_setting_mapper_1.SystemSettingMapper.toDomain(row) : null;
    }
    async save(setting) {
        const data = system_setting_mapper_1.SystemSettingMapper.toPersistence(setting);
        await this.prisma.systemSetting.upsert({
            where: { id: setting.id.toString() },
            create: data,
            update: data,
        });
    }
};
exports.PrismaSystemSettingRepository = PrismaSystemSettingRepository;
exports.PrismaSystemSettingRepository = PrismaSystemSettingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSystemSettingRepository);
//# sourceMappingURL=prisma-system-setting.repository.js.map
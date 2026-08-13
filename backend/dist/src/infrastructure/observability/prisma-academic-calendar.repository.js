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
exports.PrismaAcademicCalendarRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const academic_calendar_mapper_1 = require("./academic-calendar.mapper");
let PrismaAcademicCalendarRepository = class PrismaAcademicCalendarRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.academicCalendar.findFirst({
            where: { id: id.toString() },
        });
        return row ? academic_calendar_mapper_1.AcademicCalendarMapper.toDomain(row) : null;
    }
    async findPeriodsOn(day) {
        const rows = await this.prisma.academicCalendar.findMany({
            where: { startDate: { lte: day }, endDate: { gte: day } },
            orderBy: { startDate: 'asc' },
        });
        return rows.map((row) => academic_calendar_mapper_1.AcademicCalendarMapper.toDomain(row));
    }
};
exports.PrismaAcademicCalendarRepository = PrismaAcademicCalendarRepository;
exports.PrismaAcademicCalendarRepository = PrismaAcademicCalendarRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAcademicCalendarRepository);
//# sourceMappingURL=prisma-academic-calendar.repository.js.map
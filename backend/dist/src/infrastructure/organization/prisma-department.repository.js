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
exports.PrismaDepartmentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../persistence/prisma.service");
const department_mapper_1 = require("./department.mapper");
let PrismaDepartmentRepository = class PrismaDepartmentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.department.findFirst({
            where: { id: id.toString(), deletedAt: null },
        });
        return row ? department_mapper_1.DepartmentMapper.toDomain(row) : null;
    }
    async findByExternalRef(ref) {
        const row = await this.prisma.department.findFirst({
            where: { externalId: ref.id, sourceSystem: ref.source, deletedAt: null },
        });
        return row ? department_mapper_1.DepartmentMapper.toDomain(row) : null;
    }
    async listBySource(source) {
        const rows = await this.prisma.department.findMany({
            where: { sourceSystem: source, deletedAt: null },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => department_mapper_1.DepartmentMapper.toDomain(row));
    }
    async findAncestorOfKind(departmentId, kind) {
        let currentId = departmentId.toString();
        const visited = new Set();
        while (currentId !== null) {
            const key = currentId.toString();
            if (visited.has(key))
                break;
            visited.add(key);
            const row = await this.prisma.department.findFirst({
                where: { id: currentId, deletedAt: null },
                include: { unitType: true },
            });
            if (!row)
                return null;
            if (row.unitType.code === kind)
                return department_mapper_1.DepartmentMapper.toDomain(row);
            currentId = row.parentId;
        }
        return null;
    }
    async listChildren(parentId) {
        const rows = await this.prisma.department.findMany({
            where: { parentId: parentId.toString(), deletedAt: null },
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => department_mapper_1.DepartmentMapper.toDomain(row));
    }
    async save(department) {
        const data = department_mapper_1.DepartmentMapper.toPersistence(department);
        await this.prisma.department.upsert({
            where: { id: department.id.toString() },
            create: data,
            update: data,
        });
    }
};
exports.PrismaDepartmentRepository = PrismaDepartmentRepository;
exports.PrismaDepartmentRepository = PrismaDepartmentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDepartmentRepository);
//# sourceMappingURL=prisma-department.repository.js.map
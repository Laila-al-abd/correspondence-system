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
exports.PrismaAttributeDefinitionRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../generated/prisma/client");
const prisma_service_1 = require("../persistence/prisma.service");
const attribute_definition_mapper_1 = require("./attribute-definition.mapper");
let PrismaAttributeDefinitionRepository = class PrismaAttributeDefinitionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.attributeDefinition.findFirst({
            where: { id: id.toString(), deletedAt: null },
            include: attribute_definition_mapper_1.attributeInclude,
        });
        return row ? attribute_definition_mapper_1.AttributeDefinitionMapper.toDomain(row) : null;
    }
    async findByCode(code) {
        const row = await this.prisma.attributeDefinition.findFirst({
            where: { code, deletedAt: null },
            include: attribute_definition_mapper_1.attributeInclude,
        });
        return row ? attribute_definition_mapper_1.AttributeDefinitionMapper.toDomain(row) : null;
    }
    async list() {
        const rows = await this.prisma.attributeDefinition.findMany({
            where: { deletedAt: null },
            orderBy: { code: 'asc' },
            include: attribute_definition_mapper_1.attributeInclude,
        });
        return rows.map((row) => attribute_definition_mapper_1.AttributeDefinitionMapper.toDomain(row));
    }
    async save(definition) {
        const snapshot = definition.snapshot();
        const label = toJsonText(snapshot.label);
        const description = snapshot.description === undefined
            ? client_1.Prisma.DbNull
            : toJsonText(snapshot.description);
        await this.prisma.$transaction(async (tx) => {
            await tx.attributeDefinition.upsert({
                where: { id: snapshot.id },
                create: {
                    id: snapshot.id,
                    code: snapshot.code,
                    label,
                    dataType: snapshot.dataType,
                    description,
                },
                update: {
                    code: snapshot.code,
                    label,
                    dataType: snapshot.dataType,
                    description,
                    deletedAt: null,
                },
            });
            await tx.attributeOption.deleteMany({
                where: { attributeId: snapshot.id },
            });
            const options = definition.options;
            if (options.length > 0)
                await tx.attributeOption.createMany({
                    data: options.map((option) => ({
                        id: option.id.toString(),
                        attributeId: snapshot.id,
                        value: option.value,
                        label: toJsonText(option.label.toJSON()),
                        ordinal: option.ordinal,
                    })),
                });
        });
    }
};
exports.PrismaAttributeDefinitionRepository = PrismaAttributeDefinitionRepository;
exports.PrismaAttributeDefinitionRepository = PrismaAttributeDefinitionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAttributeDefinitionRepository);
function toJsonText(value) {
    return value.en ? { ar: value.ar, en: value.en } : { ar: value.ar };
}
//# sourceMappingURL=prisma-attribute-definition.repository.js.map
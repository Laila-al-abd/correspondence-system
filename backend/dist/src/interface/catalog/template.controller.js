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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const list_template_catalog_query_1 = require("../../application/catalog/queries/list-template-catalog/list-template-catalog.query");
const get_template_catalog_query_1 = require("../../application/catalog/queries/get-template-catalog/get-template-catalog.query");
const create_template_command_1 = require("../../application/catalog/commands/create-template/create-template.command");
const update_template_command_1 = require("../../application/catalog/commands/update-template/update-template.command");
const upsert_template_field_command_1 = require("../../application/catalog/commands/upsert-template-field/upsert-template-field.command");
const remove_template_field_command_1 = require("../../application/catalog/commands/remove-template-field/remove-template-field.command");
const reorder_template_fields_command_1 = require("../../application/catalog/commands/reorder-template-fields/reorder-template-fields.command");
const create_template_dto_1 = require("./dto/create-template.dto");
const update_template_dto_1 = require("./dto/update-template.dto");
const template_field_dto_1 = require("./dto/template-field.dto");
const permissions_decorator_1 = require("../identity/permissions.decorator");
let TemplateController = class TemplateController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    list(includeInactive) {
        return this.queryBus.execute(new list_template_catalog_query_1.ListTemplateCatalogQuery(includeInactive === 'true'));
    }
    get(idOrCode) {
        return this.queryBus.execute(new get_template_catalog_query_1.GetTemplateCatalogQuery(idOrCode));
    }
    create(dto) {
        return this.commandBus.execute(new create_template_command_1.CreateTemplateCommand(dto));
    }
    update(id, dto) {
        return this.commandBus.execute(new update_template_command_1.UpdateTemplateCommand({ ...dto, templateId: id }));
    }
    retire(id) {
        return this.commandBus.execute(new update_template_command_1.UpdateTemplateCommand({ templateId: id, isActive: false }));
    }
    upsertField(id, dto) {
        const { ordinal, ...field } = dto;
        return this.commandBus.execute(new upsert_template_field_command_1.UpsertTemplateFieldCommand({ templateId: id, field, ordinal }));
    }
    reorderFields(id, dto) {
        return this.commandBus.execute(new reorder_template_fields_command_1.ReorderTemplateFieldsCommand({
            templateId: id,
            fieldKeys: dto.fieldKeys,
        }));
    }
    removeField(id, fieldKey) {
        return this.commandBus.execute(new remove_template_field_command_1.RemoveTemplateFieldCommand({ templateId: id, fieldKey }));
    }
};
exports.TemplateController = TemplateController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('includeInactive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':idOrCode'),
    __param(0, (0, common_1.Param)('idOrCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "retire", null);
__decorate([
    (0, common_1.Put)(':id/fields'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_field_dto_1.UpsertTemplateFieldDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "upsertField", null);
__decorate([
    (0, common_1.Post)(':id/fields/reorder'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, template_field_dto_1.ReorderTemplateFieldsDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "reorderFields", null);
__decorate([
    (0, common_1.Delete)(':id/fields/:fieldKey'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fieldKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "removeField", null);
exports.TemplateController = TemplateController = __decorate([
    (0, common_1.Controller)('templates'),
    (0, permissions_decorator_1.RequireAnyPermission)('request.classify', 'template.manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TemplateController);
//# sourceMappingURL=template.controller.js.map
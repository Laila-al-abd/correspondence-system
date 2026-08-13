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
exports.LanguageController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const create_language_command_1 = require("../../application/catalog/commands/create-language/create-language.command");
const list_languages_query_1 = require("../../application/catalog/queries/list-languages/list-languages.query");
const create_language_dto_1 = require("./dto/create-language.dto");
const permissions_decorator_1 = require("../identity/permissions.decorator");
let LanguageController = class LanguageController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    list(onlyEnabled) {
        return this.queryBus.execute(new list_languages_query_1.ListLanguagesQuery(onlyEnabled === 'true'));
    }
    async create(dto) {
        const code = await this.commandBus.execute(new create_language_command_1.CreateLanguageCommand(dto));
        return { code };
    }
};
exports.LanguageController = LanguageController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('onlyEnabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LanguageController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_language_dto_1.CreateLanguageDto]),
    __metadata("design:returntype", Promise)
], LanguageController.prototype, "create", null);
exports.LanguageController = LanguageController = __decorate([
    (0, common_1.Controller)('languages'),
    (0, permissions_decorator_1.RequirePermissions)('template.manage'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], LanguageController);
//# sourceMappingURL=language.controller.js.map
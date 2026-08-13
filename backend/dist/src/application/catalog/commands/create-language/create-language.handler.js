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
exports.CreateLanguageHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const language_1 = require("../../../../domain/catalog/language");
const tokens_1 = require("../../../tokens");
const errors_1 = require("../../../errors");
const create_language_command_1 = require("./create-language.command");
let CreateLanguageHandler = class CreateLanguageHandler {
    languages;
    constructor(languages) {
        this.languages = languages;
    }
    async execute({ input }) {
        const code = input.code.trim().toLowerCase();
        if (await this.languages.findByCode(code)) {
            throw new errors_1.LanguageAlreadyExistsError(code);
        }
        const language = language_1.Language.create(input);
        await this.languages.save(language);
        return language.code;
    }
};
exports.CreateLanguageHandler = CreateLanguageHandler;
exports.CreateLanguageHandler = CreateLanguageHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_language_command_1.CreateLanguageCommand),
    __param(0, (0, common_1.Inject)(tokens_1.LANGUAGE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateLanguageHandler);
//# sourceMappingURL=create-language.handler.js.map
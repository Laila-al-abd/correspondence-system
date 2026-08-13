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
exports.ListLanguagesHandler = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const tokens_1 = require("../../../tokens");
const list_languages_query_1 = require("./list-languages.query");
let ListLanguagesHandler = class ListLanguagesHandler {
    languages;
    constructor(languages) {
        this.languages = languages;
    }
    async execute(query) {
        const all = await this.languages.list();
        return all
            .filter((language) => !query.onlyEnabled || language.isEnabled)
            .map((language) => language.toJSON());
    }
};
exports.ListLanguagesHandler = ListLanguagesHandler;
exports.ListLanguagesHandler = ListLanguagesHandler = __decorate([
    (0, cqrs_1.QueryHandler)(list_languages_query_1.ListLanguagesQuery),
    __param(0, (0, common_1.Inject)(tokens_1.LANGUAGE_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ListLanguagesHandler);
//# sourceMappingURL=list-languages.handler.js.map
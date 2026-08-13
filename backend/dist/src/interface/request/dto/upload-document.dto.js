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
exports.UploadDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../domain/request/enums");
class UploadDocumentDto {
    fileName;
    mimeType;
    contentBase64;
    docKind;
    requestActionId;
    ocrText;
}
exports.UploadDocumentDto = UploadDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "contentBase64", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.DocKind),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "docKind", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "requestActionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "ocrText", void 0);
//# sourceMappingURL=upload-document.dto.js.map
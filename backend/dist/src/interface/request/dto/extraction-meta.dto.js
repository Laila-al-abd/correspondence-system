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
exports.ExtractionMetaDto = void 0;
exports.IsExtractionMetaRecord = IsExtractionMetaRecord;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class ExtractionMetaDto {
    raw;
    charStart;
    charEnd;
    score;
}
exports.ExtractionMetaDto = ExtractionMetaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExtractionMetaDto.prototype, "raw", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExtractionMetaDto.prototype, "charStart", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExtractionMetaDto.prototype, "charEnd", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ExtractionMetaDto.prototype, "score", void 0);
function IsExtractionMetaRecord(options) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isExtractionMetaRecord',
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate(value) {
                    if (value === null ||
                        typeof value !== 'object' ||
                        Array.isArray(value))
                        return false;
                    return Object.values(value).every((entry) => {
                        if (entry === null ||
                            typeof entry !== 'object' ||
                            Array.isArray(entry))
                            return false;
                        return ((0, class_validator_1.validateSync)((0, class_transformer_1.plainToInstance)(ExtractionMetaDto, entry), {
                            whitelist: false,
                        }).length === 0);
                    });
                },
                defaultMessage(args) {
                    return `${args.property} must map each field key to { raw?, charStart?, charEnd?, score? }`;
                },
            },
        });
    };
}
//# sourceMappingURL=extraction-meta.dto.js.map
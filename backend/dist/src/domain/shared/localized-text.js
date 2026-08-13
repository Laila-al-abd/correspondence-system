"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizedText = void 0;
const value_object_1 = require("./value-object");
const guard_1 = require("./guard");
class LocalizedText extends value_object_1.ValueObject {
    constructor(props) { super(props); }
    static create(ar, en) {
        return new LocalizedText({ ar: guard_1.Guard.againstEmpty(ar, "ar"), en: en?.trim() || undefined });
    }
    get ar() { return this.props.ar; }
    get en() { return this.props.en ?? this.props.ar; }
    toJSON() { return { ...this.props }; }
}
exports.LocalizedText = LocalizedText;
//# sourceMappingURL=localized-text.js.map
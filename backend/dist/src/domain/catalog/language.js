"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Language = void 0;
const guard_1 = require("../shared/guard");
class Language {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        return new Language({
            code: guard_1.Guard.againstEmpty(input.code, 'code').toLowerCase(),
            name: guard_1.Guard.againstEmpty(input.name, 'name'),
            nativeName: guard_1.Guard.againstEmpty(input.nativeName, 'nativeName'),
            isEnabled: input.isEnabled ?? true,
            isDefault: input.isDefault ?? false,
        });
    }
    static rehydrate(props) {
        return new Language(props);
    }
    get code() {
        return this.props.code;
    }
    get name() {
        return this.props.name;
    }
    get nativeName() {
        return this.props.nativeName;
    }
    get isEnabled() {
        return this.props.isEnabled;
    }
    get isDefault() {
        return this.props.isDefault;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Language = Language;
//# sourceMappingURL=language.js.map
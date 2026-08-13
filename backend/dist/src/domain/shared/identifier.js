"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identifier = void 0;
class Identifier {
    value;
    constructor(value) {
        this.value = value;
    }
    static of(value) {
        const normalised = value.trim().toLowerCase();
        if (!normalised)
            throw new Error("Identifier cannot be empty.");
        return new Identifier(normalised);
    }
    toString() {
        return this.value;
    }
    equals(other) {
        return !!other && other.value === this.value;
    }
}
exports.Identifier = Identifier;
//# sourceMappingURL=identifier.js.map
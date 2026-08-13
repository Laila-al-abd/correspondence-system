"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCursorError = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = void 0;
exports.clampLimit = clampLimit;
exports.clampOffset = clampOffset;
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
const errors_1 = require("../errors");
exports.DEFAULT_PAGE_SIZE = 50;
exports.MAX_PAGE_SIZE = 200;
class InvalidCursorError extends errors_1.ApplicationError {
    code = 'INVALID_CURSOR';
    status = 400;
    constructor() {
        super('That page cursor is not one this endpoint issued. Start from the ' +
            'first page.');
    }
}
exports.InvalidCursorError = InvalidCursorError;
function clampLimit(raw) {
    if (raw === undefined || !Number.isFinite(raw))
        return exports.DEFAULT_PAGE_SIZE;
    return Math.min(Math.max(Math.trunc(raw), 1), exports.MAX_PAGE_SIZE);
}
function clampOffset(raw) {
    if (raw === undefined || !Number.isFinite(raw))
        return 0;
    return Math.max(Math.trunc(raw), 0);
}
function encodeCursor(payload) {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}
function decodeCursor(raw) {
    let parsed;
    try {
        parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    }
    catch {
        throw new InvalidCursorError();
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new InvalidCursorError();
    }
    return parsed;
}
//# sourceMappingURL=pagination.js.map
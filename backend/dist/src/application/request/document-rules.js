"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_MIME_TYPES = exports.MAX_DOCUMENT_BYTES = void 0;
exports.assertUploadIsAcceptable = assertUploadIsAcceptable;
const domain_error_1 = require("../../domain/shared/domain-error");
exports.MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
exports.ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
];
const SIGNATURES = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/jpeg': [[0xff, 0xd8, 0xff]],
};
function startsWith(body, signature) {
    if (body.length < signature.length)
        return false;
    return signature.every((byte, index) => body[index] === byte);
}
function assertUploadIsAcceptable(mimeType, body) {
    if (body.length === 0) {
        throw new domain_error_1.InvariantViolationError('The uploaded file is empty.');
    }
    if (body.length > exports.MAX_DOCUMENT_BYTES) {
        const limitMb = Math.round(exports.MAX_DOCUMENT_BYTES / (1024 * 1024));
        throw new domain_error_1.InvariantViolationError(`The uploaded file exceeds the ${limitMb} MB limit.`);
    }
    const declared = mimeType.split(';')[0].trim().toLowerCase();
    if (!exports.ALLOWED_MIME_TYPES.includes(declared)) {
        throw new domain_error_1.InvariantViolationError(`Unsupported file type "${mimeType}". Allowed types: ${exports.ALLOWED_MIME_TYPES.join(', ')}.`);
    }
    const signatures = SIGNATURES[declared];
    if (!signatures.some((signature) => startsWith(body, signature))) {
        throw new domain_error_1.InvariantViolationError(`The file contents do not match the declared type "${declared}".`);
    }
}
//# sourceMappingURL=document-rules.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const entity_1 = require("../shared/entity");
const guard_1 = require("../shared/guard");
const domain_error_1 = require("../shared/domain-error");
class Document extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        guard_1.Guard.againstEmpty(p.storageKey, "storageKey");
        guard_1.Guard.againstEmpty(p.fileName, "fileName");
        if (p.fileSize < 0)
            throw new domain_error_1.InvariantViolationError("fileSize cannot be negative.");
        return new Document(id, { ...p, uploadedAt: new Date() });
    }
    static rehydrate(id, props) {
        return new Document(id, props);
    }
    attachOcr(text) { this.props.ocrText = text; }
    get storageKey() { return this.props.storageKey; }
    get docKind() { return this.props.docKind; }
    get requestId() { return this.props.requestId; }
    get fileName() { return this.props.fileName; }
    snapshot() {
        return {
            requestId: this.props.requestId.toString(),
            requestActionId: this.props.requestActionId?.toString(),
            uploaderId: this.props.uploaderId.toString(),
            docKind: this.props.docKind,
            storageKey: this.props.storageKey,
            fileName: this.props.fileName,
            mimeType: this.props.mimeType,
            fileSize: this.props.fileSize,
            ocrText: this.props.ocrText,
            uploadedAt: this.props.uploadedAt,
        };
    }
}
exports.Document = Document;
//# sourceMappingURL=document.js.map
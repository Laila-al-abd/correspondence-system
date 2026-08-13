"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContextMiddleware = requestContextMiddleware;
const request_context_1 = require("../../infrastructure/shared/request-context");
function requestContextMiddleware(_req, _res, next) {
    request_context_1.RequestContextStore.run({}, () => next());
}
//# sourceMappingURL=request-context.middleware.js.map
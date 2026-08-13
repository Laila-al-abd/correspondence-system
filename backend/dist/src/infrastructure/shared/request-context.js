"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextStore = void 0;
const node_async_hooks_1 = require("node:async_hooks");
const storage = new node_async_hooks_1.AsyncLocalStorage();
exports.RequestContextStore = {
    run(context, callback) {
        return storage.run(context, callback);
    },
    set(patch) {
        const current = storage.getStore();
        if (current)
            Object.assign(current, patch);
    },
    userId() {
        return storage.getStore()?.userId;
    },
    ipAddress() {
        return storage.getStore()?.ipAddress;
    },
};
//# sourceMappingURL=request-context.js.map
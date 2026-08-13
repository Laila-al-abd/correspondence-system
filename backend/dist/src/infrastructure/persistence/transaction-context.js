"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionContext = void 0;
exports.dbClient = dbClient;
const node_async_hooks_1 = require("node:async_hooks");
const storage = new node_async_hooks_1.AsyncLocalStorage();
exports.TransactionContext = {
    run(client, callback) {
        return storage.run(client, callback);
    },
    client() {
        return storage.getStore();
    },
    isActive() {
        return storage.getStore() !== undefined;
    },
};
function dbClient(fallback) {
    return storage.getStore() ?? fallback;
}
//# sourceMappingURL=transaction-context.js.map
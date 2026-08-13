"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProviderRegistryImpl = void 0;
const errors_1 = require("../../application/errors");
class AuthProviderRegistryImpl {
    providers = new Map();
    constructor(providers) {
        for (const provider of providers) {
            this.providers.set(provider.key, provider);
        }
    }
    get(key) {
        const provider = this.providers.get(key);
        if (!provider)
            throw new errors_1.UnsupportedAuthMethodError(key);
        return provider;
    }
}
exports.AuthProviderRegistryImpl = AuthProviderRegistryImpl;
//# sourceMappingURL=auth-provider.registry.js.map
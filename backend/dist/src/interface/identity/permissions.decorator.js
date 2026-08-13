"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAnyPermission = exports.ANY_PERMISSION_KEY = exports.RequirePermissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'required_permissions';
const RequirePermissions = (...codes) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, codes);
exports.RequirePermissions = RequirePermissions;
exports.ANY_PERMISSION_KEY = 'required_any_permission';
const RequireAnyPermission = (...codes) => (0, common_1.SetMetadata)(exports.ANY_PERMISSION_KEY, codes);
exports.RequireAnyPermission = RequireAnyPermission;
//# sourceMappingURL=permissions.decorator.js.map
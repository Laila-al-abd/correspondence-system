export declare const PERMISSIONS_KEY = "required_permissions";
export declare const RequirePermissions: (...codes: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const ANY_PERMISSION_KEY = "required_any_permission";
export declare const RequireAnyPermission: (...codes: string[]) => import("@nestjs/common").CustomDecorator<string>;

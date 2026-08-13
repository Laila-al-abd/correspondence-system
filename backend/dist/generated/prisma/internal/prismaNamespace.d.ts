import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> = [
    PrismaClientOptions
] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? ((Without<T, U> & U) | (Without<U, T> & T)) & object : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly User: "User";
    readonly AttributeDefinition: "AttributeDefinition";
    readonly AttributeOption: "AttributeOption";
    readonly UserAttribute: "UserAttribute";
    readonly Role: "Role";
    readonly PermissionGroup: "PermissionGroup";
    readonly Permission: "Permission";
    readonly RolePermission: "RolePermission";
    readonly UserRole: "UserRole";
    readonly Delegation: "Delegation";
    readonly OrgUnitType: "OrgUnitType";
    readonly Department: "Department";
    readonly Language: "Language";
    readonly SensitivityLevel: "SensitivityLevel";
    readonly RequestCategory: "RequestCategory";
    readonly Template: "Template";
    readonly TemplateField: "TemplateField";
    readonly TemplateFieldOption: "TemplateFieldOption";
    readonly TemplateEligibilityRule: "TemplateEligibilityRule";
    readonly ActionType: "ActionType";
    readonly WorkflowPath: "WorkflowPath";
    readonly WorkflowStep: "WorkflowStep";
    readonly WorkflowStepAllowedAction: "WorkflowStepAllowedAction";
    readonly WorkflowStepDependency: "WorkflowStepDependency";
    readonly Request: "Request";
    readonly RequestStepInstance: "RequestStepInstance";
    readonly RequestAction: "RequestAction";
    readonly Payment: "Payment";
    readonly Document: "Document";
    readonly AcademicCalendar: "AcademicCalendar";
    readonly EventLog: "EventLog";
    readonly Notification: "Notification";
    readonly MlPrediction: "MlPrediction";
    readonly SystemSetting: "SystemSetting";
    readonly RequestNumberSequence: "RequestNumberSequence";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "attributeDefinition" | "attributeOption" | "userAttribute" | "role" | "permissionGroup" | "permission" | "rolePermission" | "userRole" | "delegation" | "orgUnitType" | "department" | "language" | "sensitivityLevel" | "requestCategory" | "template" | "templateField" | "templateFieldOption" | "templateEligibilityRule" | "actionType" | "workflowPath" | "workflowStep" | "workflowStepAllowedAction" | "workflowStepDependency" | "request" | "requestStepInstance" | "requestAction" | "payment" | "document" | "academicCalendar" | "eventLog" | "notification" | "mlPrediction" | "systemSetting" | "requestNumberSequence";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        AttributeDefinition: {
            payload: Prisma.$AttributeDefinitionPayload<ExtArgs>;
            fields: Prisma.AttributeDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AttributeDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AttributeDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.AttributeDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AttributeDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.AttributeDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>[];
                };
                create: {
                    args: Prisma.AttributeDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.AttributeDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AttributeDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.AttributeDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                update: {
                    args: Prisma.AttributeDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.AttributeDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AttributeDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AttributeDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.AttributeDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.AttributeDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAttributeDefinition>;
                };
                groupBy: {
                    args: Prisma.AttributeDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AttributeDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AttributeDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AttributeDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        AttributeOption: {
            payload: Prisma.$AttributeOptionPayload<ExtArgs>;
            fields: Prisma.AttributeOptionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AttributeOptionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AttributeOptionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>;
                };
                findFirst: {
                    args: Prisma.AttributeOptionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AttributeOptionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>;
                };
                findMany: {
                    args: Prisma.AttributeOptionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>[];
                };
                create: {
                    args: Prisma.AttributeOptionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>;
                };
                createMany: {
                    args: Prisma.AttributeOptionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AttributeOptionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>[];
                };
                delete: {
                    args: Prisma.AttributeOptionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>;
                };
                update: {
                    args: Prisma.AttributeOptionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>;
                };
                deleteMany: {
                    args: Prisma.AttributeOptionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AttributeOptionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AttributeOptionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>[];
                };
                upsert: {
                    args: Prisma.AttributeOptionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AttributeOptionPayload>;
                };
                aggregate: {
                    args: Prisma.AttributeOptionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAttributeOption>;
                };
                groupBy: {
                    args: Prisma.AttributeOptionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AttributeOptionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AttributeOptionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AttributeOptionCountAggregateOutputType> | number;
                };
            };
        };
        UserAttribute: {
            payload: Prisma.$UserAttributePayload<ExtArgs>;
            fields: Prisma.UserAttributeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserAttributeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserAttributeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>;
                };
                findFirst: {
                    args: Prisma.UserAttributeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserAttributeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>;
                };
                findMany: {
                    args: Prisma.UserAttributeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>[];
                };
                create: {
                    args: Prisma.UserAttributeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>;
                };
                createMany: {
                    args: Prisma.UserAttributeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserAttributeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>[];
                };
                delete: {
                    args: Prisma.UserAttributeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>;
                };
                update: {
                    args: Prisma.UserAttributeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>;
                };
                deleteMany: {
                    args: Prisma.UserAttributeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserAttributeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserAttributeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>[];
                };
                upsert: {
                    args: Prisma.UserAttributeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserAttributePayload>;
                };
                aggregate: {
                    args: Prisma.UserAttributeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserAttribute>;
                };
                groupBy: {
                    args: Prisma.UserAttributeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserAttributeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserAttributeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserAttributeCountAggregateOutputType> | number;
                };
            };
        };
        Role: {
            payload: Prisma.$RolePayload<ExtArgs>;
            fields: Prisma.RoleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RoleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RoleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>;
                };
                findFirst: {
                    args: Prisma.RoleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RoleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>;
                };
                findMany: {
                    args: Prisma.RoleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>[];
                };
                create: {
                    args: Prisma.RoleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>;
                };
                createMany: {
                    args: Prisma.RoleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RoleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>[];
                };
                delete: {
                    args: Prisma.RoleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>;
                };
                update: {
                    args: Prisma.RoleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>;
                };
                deleteMany: {
                    args: Prisma.RoleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RoleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RoleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>[];
                };
                upsert: {
                    args: Prisma.RoleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePayload>;
                };
                aggregate: {
                    args: Prisma.RoleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRole>;
                };
                groupBy: {
                    args: Prisma.RoleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RoleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RoleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RoleCountAggregateOutputType> | number;
                };
            };
        };
        PermissionGroup: {
            payload: Prisma.$PermissionGroupPayload<ExtArgs>;
            fields: Prisma.PermissionGroupFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionGroupFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionGroupFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionGroupFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionGroupFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>;
                };
                findMany: {
                    args: Prisma.PermissionGroupFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>[];
                };
                create: {
                    args: Prisma.PermissionGroupCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>;
                };
                createMany: {
                    args: Prisma.PermissionGroupCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionGroupCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>[];
                };
                delete: {
                    args: Prisma.PermissionGroupDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>;
                };
                update: {
                    args: Prisma.PermissionGroupUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionGroupDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionGroupUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionGroupUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionGroupUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionGroupPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionGroupAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissionGroup>;
                };
                groupBy: {
                    args: Prisma.PermissionGroupGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionGroupGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionGroupCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionGroupCountAggregateOutputType> | number;
                };
            };
        };
        Permission: {
            payload: Prisma.$PermissionPayload<ExtArgs>;
            fields: Prisma.PermissionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>;
                };
                findMany: {
                    args: Prisma.PermissionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>[];
                };
                create: {
                    args: Prisma.PermissionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>;
                };
                createMany: {
                    args: Prisma.PermissionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>[];
                };
                delete: {
                    args: Prisma.PermissionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>;
                };
                update: {
                    args: Prisma.PermissionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermission>;
                };
                groupBy: {
                    args: Prisma.PermissionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionCountAggregateOutputType> | number;
                };
            };
        };
        RolePermission: {
            payload: Prisma.$RolePermissionPayload<ExtArgs>;
            fields: Prisma.RolePermissionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RolePermissionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RolePermissionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>;
                };
                findFirst: {
                    args: Prisma.RolePermissionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RolePermissionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>;
                };
                findMany: {
                    args: Prisma.RolePermissionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>[];
                };
                create: {
                    args: Prisma.RolePermissionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>;
                };
                createMany: {
                    args: Prisma.RolePermissionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RolePermissionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>[];
                };
                delete: {
                    args: Prisma.RolePermissionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>;
                };
                update: {
                    args: Prisma.RolePermissionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>;
                };
                deleteMany: {
                    args: Prisma.RolePermissionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RolePermissionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RolePermissionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>[];
                };
                upsert: {
                    args: Prisma.RolePermissionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RolePermissionPayload>;
                };
                aggregate: {
                    args: Prisma.RolePermissionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRolePermission>;
                };
                groupBy: {
                    args: Prisma.RolePermissionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RolePermissionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RolePermissionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RolePermissionCountAggregateOutputType> | number;
                };
            };
        };
        UserRole: {
            payload: Prisma.$UserRolePayload<ExtArgs>;
            fields: Prisma.UserRoleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserRoleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserRoleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>;
                };
                findFirst: {
                    args: Prisma.UserRoleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserRoleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>;
                };
                findMany: {
                    args: Prisma.UserRoleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>[];
                };
                create: {
                    args: Prisma.UserRoleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>;
                };
                createMany: {
                    args: Prisma.UserRoleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserRoleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>[];
                };
                delete: {
                    args: Prisma.UserRoleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>;
                };
                update: {
                    args: Prisma.UserRoleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>;
                };
                deleteMany: {
                    args: Prisma.UserRoleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserRoleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserRoleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>[];
                };
                upsert: {
                    args: Prisma.UserRoleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserRolePayload>;
                };
                aggregate: {
                    args: Prisma.UserRoleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUserRole>;
                };
                groupBy: {
                    args: Prisma.UserRoleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserRoleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserRoleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserRoleCountAggregateOutputType> | number;
                };
            };
        };
        Delegation: {
            payload: Prisma.$DelegationPayload<ExtArgs>;
            fields: Prisma.DelegationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DelegationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DelegationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>;
                };
                findFirst: {
                    args: Prisma.DelegationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DelegationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>;
                };
                findMany: {
                    args: Prisma.DelegationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>[];
                };
                create: {
                    args: Prisma.DelegationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>;
                };
                createMany: {
                    args: Prisma.DelegationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DelegationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>[];
                };
                delete: {
                    args: Prisma.DelegationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>;
                };
                update: {
                    args: Prisma.DelegationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>;
                };
                deleteMany: {
                    args: Prisma.DelegationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DelegationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DelegationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>[];
                };
                upsert: {
                    args: Prisma.DelegationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DelegationPayload>;
                };
                aggregate: {
                    args: Prisma.DelegationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDelegation>;
                };
                groupBy: {
                    args: Prisma.DelegationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DelegationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DelegationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DelegationCountAggregateOutputType> | number;
                };
            };
        };
        OrgUnitType: {
            payload: Prisma.$OrgUnitTypePayload<ExtArgs>;
            fields: Prisma.OrgUnitTypeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OrgUnitTypeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OrgUnitTypeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>;
                };
                findFirst: {
                    args: Prisma.OrgUnitTypeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OrgUnitTypeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>;
                };
                findMany: {
                    args: Prisma.OrgUnitTypeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>[];
                };
                create: {
                    args: Prisma.OrgUnitTypeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>;
                };
                createMany: {
                    args: Prisma.OrgUnitTypeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OrgUnitTypeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>[];
                };
                delete: {
                    args: Prisma.OrgUnitTypeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>;
                };
                update: {
                    args: Prisma.OrgUnitTypeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>;
                };
                deleteMany: {
                    args: Prisma.OrgUnitTypeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OrgUnitTypeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OrgUnitTypeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>[];
                };
                upsert: {
                    args: Prisma.OrgUnitTypeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OrgUnitTypePayload>;
                };
                aggregate: {
                    args: Prisma.OrgUnitTypeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOrgUnitType>;
                };
                groupBy: {
                    args: Prisma.OrgUnitTypeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrgUnitTypeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OrgUnitTypeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OrgUnitTypeCountAggregateOutputType> | number;
                };
            };
        };
        Department: {
            payload: Prisma.$DepartmentPayload<ExtArgs>;
            fields: Prisma.DepartmentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DepartmentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DepartmentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>;
                };
                findFirst: {
                    args: Prisma.DepartmentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DepartmentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>;
                };
                findMany: {
                    args: Prisma.DepartmentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>[];
                };
                create: {
                    args: Prisma.DepartmentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>;
                };
                createMany: {
                    args: Prisma.DepartmentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DepartmentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>[];
                };
                delete: {
                    args: Prisma.DepartmentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>;
                };
                update: {
                    args: Prisma.DepartmentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>;
                };
                deleteMany: {
                    args: Prisma.DepartmentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DepartmentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DepartmentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>[];
                };
                upsert: {
                    args: Prisma.DepartmentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DepartmentPayload>;
                };
                aggregate: {
                    args: Prisma.DepartmentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDepartment>;
                };
                groupBy: {
                    args: Prisma.DepartmentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DepartmentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DepartmentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DepartmentCountAggregateOutputType> | number;
                };
            };
        };
        Language: {
            payload: Prisma.$LanguagePayload<ExtArgs>;
            fields: Prisma.LanguageFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.LanguageFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.LanguageFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>;
                };
                findFirst: {
                    args: Prisma.LanguageFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.LanguageFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>;
                };
                findMany: {
                    args: Prisma.LanguageFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>[];
                };
                create: {
                    args: Prisma.LanguageCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>;
                };
                createMany: {
                    args: Prisma.LanguageCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.LanguageCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>[];
                };
                delete: {
                    args: Prisma.LanguageDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>;
                };
                update: {
                    args: Prisma.LanguageUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>;
                };
                deleteMany: {
                    args: Prisma.LanguageDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.LanguageUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.LanguageUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>[];
                };
                upsert: {
                    args: Prisma.LanguageUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LanguagePayload>;
                };
                aggregate: {
                    args: Prisma.LanguageAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateLanguage>;
                };
                groupBy: {
                    args: Prisma.LanguageGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LanguageGroupByOutputType>[];
                };
                count: {
                    args: Prisma.LanguageCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LanguageCountAggregateOutputType> | number;
                };
            };
        };
        SensitivityLevel: {
            payload: Prisma.$SensitivityLevelPayload<ExtArgs>;
            fields: Prisma.SensitivityLevelFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SensitivityLevelFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SensitivityLevelFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>;
                };
                findFirst: {
                    args: Prisma.SensitivityLevelFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SensitivityLevelFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>;
                };
                findMany: {
                    args: Prisma.SensitivityLevelFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>[];
                };
                create: {
                    args: Prisma.SensitivityLevelCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>;
                };
                createMany: {
                    args: Prisma.SensitivityLevelCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SensitivityLevelCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>[];
                };
                delete: {
                    args: Prisma.SensitivityLevelDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>;
                };
                update: {
                    args: Prisma.SensitivityLevelUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>;
                };
                deleteMany: {
                    args: Prisma.SensitivityLevelDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SensitivityLevelUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SensitivityLevelUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>[];
                };
                upsert: {
                    args: Prisma.SensitivityLevelUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SensitivityLevelPayload>;
                };
                aggregate: {
                    args: Prisma.SensitivityLevelAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSensitivityLevel>;
                };
                groupBy: {
                    args: Prisma.SensitivityLevelGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SensitivityLevelGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SensitivityLevelCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SensitivityLevelCountAggregateOutputType> | number;
                };
            };
        };
        RequestCategory: {
            payload: Prisma.$RequestCategoryPayload<ExtArgs>;
            fields: Prisma.RequestCategoryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequestCategoryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequestCategoryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>;
                };
                findFirst: {
                    args: Prisma.RequestCategoryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequestCategoryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>;
                };
                findMany: {
                    args: Prisma.RequestCategoryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>[];
                };
                create: {
                    args: Prisma.RequestCategoryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>;
                };
                createMany: {
                    args: Prisma.RequestCategoryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequestCategoryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>[];
                };
                delete: {
                    args: Prisma.RequestCategoryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>;
                };
                update: {
                    args: Prisma.RequestCategoryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>;
                };
                deleteMany: {
                    args: Prisma.RequestCategoryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequestCategoryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequestCategoryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>[];
                };
                upsert: {
                    args: Prisma.RequestCategoryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestCategoryPayload>;
                };
                aggregate: {
                    args: Prisma.RequestCategoryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequestCategory>;
                };
                groupBy: {
                    args: Prisma.RequestCategoryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestCategoryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequestCategoryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestCategoryCountAggregateOutputType> | number;
                };
            };
        };
        Template: {
            payload: Prisma.$TemplatePayload<ExtArgs>;
            fields: Prisma.TemplateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TemplateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TemplateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>;
                };
                findFirst: {
                    args: Prisma.TemplateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TemplateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>;
                };
                findMany: {
                    args: Prisma.TemplateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>[];
                };
                create: {
                    args: Prisma.TemplateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>;
                };
                createMany: {
                    args: Prisma.TemplateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TemplateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>[];
                };
                delete: {
                    args: Prisma.TemplateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>;
                };
                update: {
                    args: Prisma.TemplateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>;
                };
                deleteMany: {
                    args: Prisma.TemplateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TemplateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TemplateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>[];
                };
                upsert: {
                    args: Prisma.TemplateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplatePayload>;
                };
                aggregate: {
                    args: Prisma.TemplateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTemplate>;
                };
                groupBy: {
                    args: Prisma.TemplateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TemplateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateCountAggregateOutputType> | number;
                };
            };
        };
        TemplateField: {
            payload: Prisma.$TemplateFieldPayload<ExtArgs>;
            fields: Prisma.TemplateFieldFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TemplateFieldFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TemplateFieldFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>;
                };
                findFirst: {
                    args: Prisma.TemplateFieldFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TemplateFieldFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>;
                };
                findMany: {
                    args: Prisma.TemplateFieldFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>[];
                };
                create: {
                    args: Prisma.TemplateFieldCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>;
                };
                createMany: {
                    args: Prisma.TemplateFieldCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TemplateFieldCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>[];
                };
                delete: {
                    args: Prisma.TemplateFieldDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>;
                };
                update: {
                    args: Prisma.TemplateFieldUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>;
                };
                deleteMany: {
                    args: Prisma.TemplateFieldDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TemplateFieldUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TemplateFieldUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>[];
                };
                upsert: {
                    args: Prisma.TemplateFieldUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldPayload>;
                };
                aggregate: {
                    args: Prisma.TemplateFieldAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTemplateField>;
                };
                groupBy: {
                    args: Prisma.TemplateFieldGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateFieldGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TemplateFieldCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateFieldCountAggregateOutputType> | number;
                };
            };
        };
        TemplateFieldOption: {
            payload: Prisma.$TemplateFieldOptionPayload<ExtArgs>;
            fields: Prisma.TemplateFieldOptionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TemplateFieldOptionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TemplateFieldOptionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>;
                };
                findFirst: {
                    args: Prisma.TemplateFieldOptionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TemplateFieldOptionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>;
                };
                findMany: {
                    args: Prisma.TemplateFieldOptionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>[];
                };
                create: {
                    args: Prisma.TemplateFieldOptionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>;
                };
                createMany: {
                    args: Prisma.TemplateFieldOptionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TemplateFieldOptionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>[];
                };
                delete: {
                    args: Prisma.TemplateFieldOptionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>;
                };
                update: {
                    args: Prisma.TemplateFieldOptionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>;
                };
                deleteMany: {
                    args: Prisma.TemplateFieldOptionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TemplateFieldOptionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TemplateFieldOptionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>[];
                };
                upsert: {
                    args: Prisma.TemplateFieldOptionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateFieldOptionPayload>;
                };
                aggregate: {
                    args: Prisma.TemplateFieldOptionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTemplateFieldOption>;
                };
                groupBy: {
                    args: Prisma.TemplateFieldOptionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateFieldOptionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TemplateFieldOptionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateFieldOptionCountAggregateOutputType> | number;
                };
            };
        };
        TemplateEligibilityRule: {
            payload: Prisma.$TemplateEligibilityRulePayload<ExtArgs>;
            fields: Prisma.TemplateEligibilityRuleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TemplateEligibilityRuleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TemplateEligibilityRuleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>;
                };
                findFirst: {
                    args: Prisma.TemplateEligibilityRuleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TemplateEligibilityRuleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>;
                };
                findMany: {
                    args: Prisma.TemplateEligibilityRuleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>[];
                };
                create: {
                    args: Prisma.TemplateEligibilityRuleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>;
                };
                createMany: {
                    args: Prisma.TemplateEligibilityRuleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TemplateEligibilityRuleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>[];
                };
                delete: {
                    args: Prisma.TemplateEligibilityRuleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>;
                };
                update: {
                    args: Prisma.TemplateEligibilityRuleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>;
                };
                deleteMany: {
                    args: Prisma.TemplateEligibilityRuleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TemplateEligibilityRuleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TemplateEligibilityRuleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>[];
                };
                upsert: {
                    args: Prisma.TemplateEligibilityRuleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TemplateEligibilityRulePayload>;
                };
                aggregate: {
                    args: Prisma.TemplateEligibilityRuleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTemplateEligibilityRule>;
                };
                groupBy: {
                    args: Prisma.TemplateEligibilityRuleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateEligibilityRuleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TemplateEligibilityRuleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TemplateEligibilityRuleCountAggregateOutputType> | number;
                };
            };
        };
        ActionType: {
            payload: Prisma.$ActionTypePayload<ExtArgs>;
            fields: Prisma.ActionTypeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ActionTypeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ActionTypeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>;
                };
                findFirst: {
                    args: Prisma.ActionTypeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ActionTypeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>;
                };
                findMany: {
                    args: Prisma.ActionTypeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>[];
                };
                create: {
                    args: Prisma.ActionTypeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>;
                };
                createMany: {
                    args: Prisma.ActionTypeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ActionTypeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>[];
                };
                delete: {
                    args: Prisma.ActionTypeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>;
                };
                update: {
                    args: Prisma.ActionTypeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>;
                };
                deleteMany: {
                    args: Prisma.ActionTypeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ActionTypeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ActionTypeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>[];
                };
                upsert: {
                    args: Prisma.ActionTypeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ActionTypePayload>;
                };
                aggregate: {
                    args: Prisma.ActionTypeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateActionType>;
                };
                groupBy: {
                    args: Prisma.ActionTypeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ActionTypeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ActionTypeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ActionTypeCountAggregateOutputType> | number;
                };
            };
        };
        WorkflowPath: {
            payload: Prisma.$WorkflowPathPayload<ExtArgs>;
            fields: Prisma.WorkflowPathFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkflowPathFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkflowPathFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>;
                };
                findFirst: {
                    args: Prisma.WorkflowPathFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkflowPathFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>;
                };
                findMany: {
                    args: Prisma.WorkflowPathFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>[];
                };
                create: {
                    args: Prisma.WorkflowPathCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>;
                };
                createMany: {
                    args: Prisma.WorkflowPathCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkflowPathCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>[];
                };
                delete: {
                    args: Prisma.WorkflowPathDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>;
                };
                update: {
                    args: Prisma.WorkflowPathUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkflowPathDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkflowPathUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkflowPathUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>[];
                };
                upsert: {
                    args: Prisma.WorkflowPathUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowPathPayload>;
                };
                aggregate: {
                    args: Prisma.WorkflowPathAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkflowPath>;
                };
                groupBy: {
                    args: Prisma.WorkflowPathGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowPathGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkflowPathCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowPathCountAggregateOutputType> | number;
                };
            };
        };
        WorkflowStep: {
            payload: Prisma.$WorkflowStepPayload<ExtArgs>;
            fields: Prisma.WorkflowStepFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkflowStepFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkflowStepFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>;
                };
                findFirst: {
                    args: Prisma.WorkflowStepFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkflowStepFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>;
                };
                findMany: {
                    args: Prisma.WorkflowStepFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>[];
                };
                create: {
                    args: Prisma.WorkflowStepCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>;
                };
                createMany: {
                    args: Prisma.WorkflowStepCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkflowStepCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>[];
                };
                delete: {
                    args: Prisma.WorkflowStepDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>;
                };
                update: {
                    args: Prisma.WorkflowStepUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkflowStepDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkflowStepUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkflowStepUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>[];
                };
                upsert: {
                    args: Prisma.WorkflowStepUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepPayload>;
                };
                aggregate: {
                    args: Prisma.WorkflowStepAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkflowStep>;
                };
                groupBy: {
                    args: Prisma.WorkflowStepGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowStepGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkflowStepCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowStepCountAggregateOutputType> | number;
                };
            };
        };
        WorkflowStepAllowedAction: {
            payload: Prisma.$WorkflowStepAllowedActionPayload<ExtArgs>;
            fields: Prisma.WorkflowStepAllowedActionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkflowStepAllowedActionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkflowStepAllowedActionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>;
                };
                findFirst: {
                    args: Prisma.WorkflowStepAllowedActionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkflowStepAllowedActionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>;
                };
                findMany: {
                    args: Prisma.WorkflowStepAllowedActionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>[];
                };
                create: {
                    args: Prisma.WorkflowStepAllowedActionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>;
                };
                createMany: {
                    args: Prisma.WorkflowStepAllowedActionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkflowStepAllowedActionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>[];
                };
                delete: {
                    args: Prisma.WorkflowStepAllowedActionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>;
                };
                update: {
                    args: Prisma.WorkflowStepAllowedActionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkflowStepAllowedActionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkflowStepAllowedActionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkflowStepAllowedActionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>[];
                };
                upsert: {
                    args: Prisma.WorkflowStepAllowedActionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepAllowedActionPayload>;
                };
                aggregate: {
                    args: Prisma.WorkflowStepAllowedActionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkflowStepAllowedAction>;
                };
                groupBy: {
                    args: Prisma.WorkflowStepAllowedActionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowStepAllowedActionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkflowStepAllowedActionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowStepAllowedActionCountAggregateOutputType> | number;
                };
            };
        };
        WorkflowStepDependency: {
            payload: Prisma.$WorkflowStepDependencyPayload<ExtArgs>;
            fields: Prisma.WorkflowStepDependencyFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkflowStepDependencyFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkflowStepDependencyFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>;
                };
                findFirst: {
                    args: Prisma.WorkflowStepDependencyFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkflowStepDependencyFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>;
                };
                findMany: {
                    args: Prisma.WorkflowStepDependencyFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>[];
                };
                create: {
                    args: Prisma.WorkflowStepDependencyCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>;
                };
                createMany: {
                    args: Prisma.WorkflowStepDependencyCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkflowStepDependencyCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>[];
                };
                delete: {
                    args: Prisma.WorkflowStepDependencyDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>;
                };
                update: {
                    args: Prisma.WorkflowStepDependencyUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkflowStepDependencyDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkflowStepDependencyUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkflowStepDependencyUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>[];
                };
                upsert: {
                    args: Prisma.WorkflowStepDependencyUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkflowStepDependencyPayload>;
                };
                aggregate: {
                    args: Prisma.WorkflowStepDependencyAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorkflowStepDependency>;
                };
                groupBy: {
                    args: Prisma.WorkflowStepDependencyGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowStepDependencyGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkflowStepDependencyCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkflowStepDependencyCountAggregateOutputType> | number;
                };
            };
        };
        Request: {
            payload: Prisma.$RequestPayload<ExtArgs>;
            fields: Prisma.RequestFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequestFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequestFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>;
                };
                findFirst: {
                    args: Prisma.RequestFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequestFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>;
                };
                findMany: {
                    args: Prisma.RequestFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>[];
                };
                create: {
                    args: Prisma.RequestCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>;
                };
                createMany: {
                    args: Prisma.RequestCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequestCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>[];
                };
                delete: {
                    args: Prisma.RequestDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>;
                };
                update: {
                    args: Prisma.RequestUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>;
                };
                deleteMany: {
                    args: Prisma.RequestDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequestUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequestUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>[];
                };
                upsert: {
                    args: Prisma.RequestUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestPayload>;
                };
                aggregate: {
                    args: Prisma.RequestAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequest>;
                };
                groupBy: {
                    args: Prisma.RequestGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequestCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestCountAggregateOutputType> | number;
                };
            };
        };
        RequestStepInstance: {
            payload: Prisma.$RequestStepInstancePayload<ExtArgs>;
            fields: Prisma.RequestStepInstanceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequestStepInstanceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequestStepInstanceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>;
                };
                findFirst: {
                    args: Prisma.RequestStepInstanceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequestStepInstanceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>;
                };
                findMany: {
                    args: Prisma.RequestStepInstanceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>[];
                };
                create: {
                    args: Prisma.RequestStepInstanceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>;
                };
                createMany: {
                    args: Prisma.RequestStepInstanceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequestStepInstanceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>[];
                };
                delete: {
                    args: Prisma.RequestStepInstanceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>;
                };
                update: {
                    args: Prisma.RequestStepInstanceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>;
                };
                deleteMany: {
                    args: Prisma.RequestStepInstanceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequestStepInstanceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequestStepInstanceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>[];
                };
                upsert: {
                    args: Prisma.RequestStepInstanceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestStepInstancePayload>;
                };
                aggregate: {
                    args: Prisma.RequestStepInstanceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequestStepInstance>;
                };
                groupBy: {
                    args: Prisma.RequestStepInstanceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestStepInstanceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequestStepInstanceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestStepInstanceCountAggregateOutputType> | number;
                };
            };
        };
        RequestAction: {
            payload: Prisma.$RequestActionPayload<ExtArgs>;
            fields: Prisma.RequestActionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequestActionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequestActionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>;
                };
                findFirst: {
                    args: Prisma.RequestActionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequestActionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>;
                };
                findMany: {
                    args: Prisma.RequestActionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>[];
                };
                create: {
                    args: Prisma.RequestActionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>;
                };
                createMany: {
                    args: Prisma.RequestActionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequestActionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>[];
                };
                delete: {
                    args: Prisma.RequestActionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>;
                };
                update: {
                    args: Prisma.RequestActionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>;
                };
                deleteMany: {
                    args: Prisma.RequestActionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequestActionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequestActionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>[];
                };
                upsert: {
                    args: Prisma.RequestActionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestActionPayload>;
                };
                aggregate: {
                    args: Prisma.RequestActionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequestAction>;
                };
                groupBy: {
                    args: Prisma.RequestActionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestActionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequestActionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestActionCountAggregateOutputType> | number;
                };
            };
        };
        Payment: {
            payload: Prisma.$PaymentPayload<ExtArgs>;
            fields: Prisma.PaymentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PaymentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PaymentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>;
                };
                findFirst: {
                    args: Prisma.PaymentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PaymentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>;
                };
                findMany: {
                    args: Prisma.PaymentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>[];
                };
                create: {
                    args: Prisma.PaymentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>;
                };
                createMany: {
                    args: Prisma.PaymentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PaymentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>[];
                };
                delete: {
                    args: Prisma.PaymentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>;
                };
                update: {
                    args: Prisma.PaymentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>;
                };
                deleteMany: {
                    args: Prisma.PaymentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PaymentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PaymentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>[];
                };
                upsert: {
                    args: Prisma.PaymentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PaymentPayload>;
                };
                aggregate: {
                    args: Prisma.PaymentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePayment>;
                };
                groupBy: {
                    args: Prisma.PaymentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PaymentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PaymentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PaymentCountAggregateOutputType> | number;
                };
            };
        };
        Document: {
            payload: Prisma.$DocumentPayload<ExtArgs>;
            fields: Prisma.DocumentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DocumentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DocumentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>;
                };
                findFirst: {
                    args: Prisma.DocumentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DocumentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>;
                };
                findMany: {
                    args: Prisma.DocumentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>[];
                };
                create: {
                    args: Prisma.DocumentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>;
                };
                createMany: {
                    args: Prisma.DocumentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DocumentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>[];
                };
                delete: {
                    args: Prisma.DocumentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>;
                };
                update: {
                    args: Prisma.DocumentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>;
                };
                deleteMany: {
                    args: Prisma.DocumentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DocumentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DocumentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>[];
                };
                upsert: {
                    args: Prisma.DocumentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DocumentPayload>;
                };
                aggregate: {
                    args: Prisma.DocumentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDocument>;
                };
                groupBy: {
                    args: Prisma.DocumentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DocumentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DocumentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DocumentCountAggregateOutputType> | number;
                };
            };
        };
        AcademicCalendar: {
            payload: Prisma.$AcademicCalendarPayload<ExtArgs>;
            fields: Prisma.AcademicCalendarFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AcademicCalendarFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AcademicCalendarFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>;
                };
                findFirst: {
                    args: Prisma.AcademicCalendarFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AcademicCalendarFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>;
                };
                findMany: {
                    args: Prisma.AcademicCalendarFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>[];
                };
                create: {
                    args: Prisma.AcademicCalendarCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>;
                };
                createMany: {
                    args: Prisma.AcademicCalendarCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AcademicCalendarCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>[];
                };
                delete: {
                    args: Prisma.AcademicCalendarDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>;
                };
                update: {
                    args: Prisma.AcademicCalendarUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>;
                };
                deleteMany: {
                    args: Prisma.AcademicCalendarDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AcademicCalendarUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AcademicCalendarUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>[];
                };
                upsert: {
                    args: Prisma.AcademicCalendarUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AcademicCalendarPayload>;
                };
                aggregate: {
                    args: Prisma.AcademicCalendarAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAcademicCalendar>;
                };
                groupBy: {
                    args: Prisma.AcademicCalendarGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AcademicCalendarGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AcademicCalendarCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AcademicCalendarCountAggregateOutputType> | number;
                };
            };
        };
        EventLog: {
            payload: Prisma.$EventLogPayload<ExtArgs>;
            fields: Prisma.EventLogFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EventLogFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EventLogFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>;
                };
                findFirst: {
                    args: Prisma.EventLogFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EventLogFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>;
                };
                findMany: {
                    args: Prisma.EventLogFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>[];
                };
                create: {
                    args: Prisma.EventLogCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>;
                };
                createMany: {
                    args: Prisma.EventLogCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EventLogCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>[];
                };
                delete: {
                    args: Prisma.EventLogDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>;
                };
                update: {
                    args: Prisma.EventLogUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>;
                };
                deleteMany: {
                    args: Prisma.EventLogDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EventLogUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EventLogUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>[];
                };
                upsert: {
                    args: Prisma.EventLogUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EventLogPayload>;
                };
                aggregate: {
                    args: Prisma.EventLogAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEventLog>;
                };
                groupBy: {
                    args: Prisma.EventLogGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EventLogGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EventLogCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EventLogCountAggregateOutputType> | number;
                };
            };
        };
        Notification: {
            payload: Prisma.$NotificationPayload<ExtArgs>;
            fields: Prisma.NotificationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.NotificationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                findFirst: {
                    args: Prisma.NotificationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                findMany: {
                    args: Prisma.NotificationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>[];
                };
                create: {
                    args: Prisma.NotificationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                createMany: {
                    args: Prisma.NotificationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>[];
                };
                delete: {
                    args: Prisma.NotificationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                update: {
                    args: Prisma.NotificationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                deleteMany: {
                    args: Prisma.NotificationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.NotificationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>[];
                };
                upsert: {
                    args: Prisma.NotificationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$NotificationPayload>;
                };
                aggregate: {
                    args: Prisma.NotificationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateNotification>;
                };
                groupBy: {
                    args: Prisma.NotificationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.NotificationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.NotificationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.NotificationCountAggregateOutputType> | number;
                };
            };
        };
        MlPrediction: {
            payload: Prisma.$MlPredictionPayload<ExtArgs>;
            fields: Prisma.MlPredictionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MlPredictionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MlPredictionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>;
                };
                findFirst: {
                    args: Prisma.MlPredictionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MlPredictionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>;
                };
                findMany: {
                    args: Prisma.MlPredictionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>[];
                };
                create: {
                    args: Prisma.MlPredictionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>;
                };
                createMany: {
                    args: Prisma.MlPredictionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MlPredictionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>[];
                };
                delete: {
                    args: Prisma.MlPredictionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>;
                };
                update: {
                    args: Prisma.MlPredictionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>;
                };
                deleteMany: {
                    args: Prisma.MlPredictionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MlPredictionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MlPredictionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>[];
                };
                upsert: {
                    args: Prisma.MlPredictionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MlPredictionPayload>;
                };
                aggregate: {
                    args: Prisma.MlPredictionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMlPrediction>;
                };
                groupBy: {
                    args: Prisma.MlPredictionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MlPredictionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MlPredictionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MlPredictionCountAggregateOutputType> | number;
                };
            };
        };
        SystemSetting: {
            payload: Prisma.$SystemSettingPayload<ExtArgs>;
            fields: Prisma.SystemSettingFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SystemSettingFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SystemSettingFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>;
                };
                findFirst: {
                    args: Prisma.SystemSettingFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SystemSettingFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>;
                };
                findMany: {
                    args: Prisma.SystemSettingFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>[];
                };
                create: {
                    args: Prisma.SystemSettingCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>;
                };
                createMany: {
                    args: Prisma.SystemSettingCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SystemSettingCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>[];
                };
                delete: {
                    args: Prisma.SystemSettingDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>;
                };
                update: {
                    args: Prisma.SystemSettingUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>;
                };
                deleteMany: {
                    args: Prisma.SystemSettingDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SystemSettingUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SystemSettingUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>[];
                };
                upsert: {
                    args: Prisma.SystemSettingUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SystemSettingPayload>;
                };
                aggregate: {
                    args: Prisma.SystemSettingAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSystemSetting>;
                };
                groupBy: {
                    args: Prisma.SystemSettingGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SystemSettingGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SystemSettingCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SystemSettingCountAggregateOutputType> | number;
                };
            };
        };
        RequestNumberSequence: {
            payload: Prisma.$RequestNumberSequencePayload<ExtArgs>;
            fields: Prisma.RequestNumberSequenceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RequestNumberSequenceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RequestNumberSequenceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>;
                };
                findFirst: {
                    args: Prisma.RequestNumberSequenceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RequestNumberSequenceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>;
                };
                findMany: {
                    args: Prisma.RequestNumberSequenceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>[];
                };
                create: {
                    args: Prisma.RequestNumberSequenceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>;
                };
                createMany: {
                    args: Prisma.RequestNumberSequenceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RequestNumberSequenceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>[];
                };
                delete: {
                    args: Prisma.RequestNumberSequenceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>;
                };
                update: {
                    args: Prisma.RequestNumberSequenceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>;
                };
                deleteMany: {
                    args: Prisma.RequestNumberSequenceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RequestNumberSequenceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RequestNumberSequenceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>[];
                };
                upsert: {
                    args: Prisma.RequestNumberSequenceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RequestNumberSequencePayload>;
                };
                aggregate: {
                    args: Prisma.RequestNumberSequenceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRequestNumberSequence>;
                };
                groupBy: {
                    args: Prisma.RequestNumberSequenceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestNumberSequenceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RequestNumberSequenceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RequestNumberSequenceCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly userType: "userType";
    readonly fullNameAr: "fullNameAr";
    readonly fullNameEn: "fullNameEn";
    readonly institutionalNumber: "institutionalNumber";
    readonly email: "email";
    readonly phone: "phone";
    readonly passwordHash: "passwordHash";
    readonly authProvider: "authProvider";
    readonly applicantPurpose: "applicantPurpose";
    readonly departmentId: "departmentId";
    readonly preferredLang: "preferredLang";
    readonly signatureKey: "signatureKey";
    readonly status: "status";
    readonly createdAt: "createdAt";
    readonly lastSyncedAt: "lastSyncedAt";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const AttributeDefinitionScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly code: "code";
    readonly label: "label";
    readonly dataType: "dataType";
    readonly description: "description";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type AttributeDefinitionScalarFieldEnum = (typeof AttributeDefinitionScalarFieldEnum)[keyof typeof AttributeDefinitionScalarFieldEnum];
export declare const AttributeOptionScalarFieldEnum: {
    readonly id: "id";
    readonly attributeId: "attributeId";
    readonly value: "value";
    readonly label: "label";
    readonly ordinal: "ordinal";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type AttributeOptionScalarFieldEnum = (typeof AttributeOptionScalarFieldEnum)[keyof typeof AttributeOptionScalarFieldEnum];
export declare const UserAttributeScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly userId: "userId";
    readonly attributeId: "attributeId";
    readonly value: "value";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type UserAttributeScalarFieldEnum = (typeof UserAttributeScalarFieldEnum)[keyof typeof UserAttributeScalarFieldEnum];
export declare const RoleScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly isSystem: "isSystem";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum];
export declare const PermissionGroupScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type PermissionGroupScalarFieldEnum = (typeof PermissionGroupScalarFieldEnum)[keyof typeof PermissionGroupScalarFieldEnum];
export declare const PermissionScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly groupId: "groupId";
    readonly code: "code";
    readonly name: "name";
    readonly description: "description";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type PermissionScalarFieldEnum = (typeof PermissionScalarFieldEnum)[keyof typeof PermissionScalarFieldEnum];
export declare const RolePermissionScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly id: "id";
    readonly roleId: "roleId";
    readonly permissionId: "permissionId";
    readonly createdBy: "createdBy";
};
export type RolePermissionScalarFieldEnum = (typeof RolePermissionScalarFieldEnum)[keyof typeof RolePermissionScalarFieldEnum];
export declare const UserRoleScalarFieldEnum: {
    readonly id: "id";
    readonly userId: "userId";
    readonly roleId: "roleId";
    readonly departmentId: "departmentId";
    readonly reason: "reason";
    readonly expiresAt: "expiresAt";
    readonly assignedBy: "assignedBy";
    readonly assignedAt: "assignedAt";
};
export type UserRoleScalarFieldEnum = (typeof UserRoleScalarFieldEnum)[keyof typeof UserRoleScalarFieldEnum];
export declare const DelegationScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly delegatorId: "delegatorId";
    readonly delegateId: "delegateId";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly reason: "reason";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type DelegationScalarFieldEnum = (typeof DelegationScalarFieldEnum)[keyof typeof DelegationScalarFieldEnum];
export declare const OrgUnitTypeScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly description: "description";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type OrgUnitTypeScalarFieldEnum = (typeof OrgUnitTypeScalarFieldEnum)[keyof typeof OrgUnitTypeScalarFieldEnum];
export declare const DepartmentScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly parentId: "parentId";
    readonly unitTypeId: "unitTypeId";
    readonly name: "name";
    readonly description: "description";
    readonly isActive: "isActive";
    readonly externalId: "externalId";
    readonly sourceSystem: "sourceSystem";
    readonly lastSyncedAt: "lastSyncedAt";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type DepartmentScalarFieldEnum = (typeof DepartmentScalarFieldEnum)[keyof typeof DepartmentScalarFieldEnum];
export declare const LanguageScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly code: "code";
    readonly name: "name";
    readonly nativeName: "nativeName";
    readonly isEnabled: "isEnabled";
    readonly isDefault: "isDefault";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type LanguageScalarFieldEnum = (typeof LanguageScalarFieldEnum)[keyof typeof LanguageScalarFieldEnum];
export declare const SensitivityLevelScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly name: "name";
    readonly rank: "rank";
    readonly description: "description";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type SensitivityLevelScalarFieldEnum = (typeof SensitivityLevelScalarFieldEnum)[keyof typeof SensitivityLevelScalarFieldEnum];
export declare const RequestCategoryScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly name: "name";
    readonly description: "description";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type RequestCategoryScalarFieldEnum = (typeof RequestCategoryScalarFieldEnum)[keyof typeof RequestCategoryScalarFieldEnum];
export declare const TemplateScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly code: "code";
    readonly categoryId: "categoryId";
    readonly title: "title";
    readonly description: "description";
    readonly classifierDocument: "classifierDocument";
    readonly sensitivityLevelId: "sensitivityLevelId";
    readonly defaultPriority: "defaultPriority";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type TemplateScalarFieldEnum = (typeof TemplateScalarFieldEnum)[keyof typeof TemplateScalarFieldEnum];
export declare const TemplateFieldScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly templateId: "templateId";
    readonly fieldKey: "fieldKey";
    readonly label: "label";
    readonly extractionQuestion: "extractionQuestion";
    readonly dataType: "dataType";
    readonly isRequired: "isRequired";
    readonly ordinal: "ordinal";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type TemplateFieldScalarFieldEnum = (typeof TemplateFieldScalarFieldEnum)[keyof typeof TemplateFieldScalarFieldEnum];
export declare const TemplateFieldOptionScalarFieldEnum: {
    readonly id: "id";
    readonly templateFieldId: "templateFieldId";
    readonly value: "value";
    readonly label: "label";
    readonly ordinal: "ordinal";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type TemplateFieldOptionScalarFieldEnum = (typeof TemplateFieldOptionScalarFieldEnum)[keyof typeof TemplateFieldOptionScalarFieldEnum];
export declare const TemplateEligibilityRuleScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly templateId: "templateId";
    readonly attributeId: "attributeId";
    readonly operator: "operator";
    readonly value: "value";
    readonly description: "description";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type TemplateEligibilityRuleScalarFieldEnum = (typeof TemplateEligibilityRuleScalarFieldEnum)[keyof typeof TemplateEligibilityRuleScalarFieldEnum];
export declare const ActionTypeScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly code: "code";
    readonly name: "name";
    readonly isTerminal: "isTerminal";
    readonly description: "description";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type ActionTypeScalarFieldEnum = (typeof ActionTypeScalarFieldEnum)[keyof typeof ActionTypeScalarFieldEnum];
export declare const WorkflowPathScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly templateId: "templateId";
    readonly name: "name";
    readonly description: "description";
    readonly isActive: "isActive";
    readonly createdAt: "createdAt";
    readonly deletedAt: "deletedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type WorkflowPathScalarFieldEnum = (typeof WorkflowPathScalarFieldEnum)[keyof typeof WorkflowPathScalarFieldEnum];
export declare const WorkflowStepScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly workflowPathId: "workflowPathId";
    readonly name: "name";
    readonly description: "description";
    readonly assigneeType: "assigneeType";
    readonly assigneeRoleId: "assigneeRoleId";
    readonly assigneeDepartmentId: "assigneeDepartmentId";
    readonly defaultActionTypeId: "defaultActionTypeId";
    readonly slaHours: "slaHours";
    readonly pausesSla: "pausesSla";
    readonly feeAmount: "feeAmount";
    readonly feeCurrency: "feeCurrency";
    readonly createdAt: "createdAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type WorkflowStepScalarFieldEnum = (typeof WorkflowStepScalarFieldEnum)[keyof typeof WorkflowStepScalarFieldEnum];
export declare const WorkflowStepAllowedActionScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly id: "id";
    readonly workflowStepId: "workflowStepId";
    readonly actionTypeId: "actionTypeId";
    readonly createdBy: "createdBy";
};
export type WorkflowStepAllowedActionScalarFieldEnum = (typeof WorkflowStepAllowedActionScalarFieldEnum)[keyof typeof WorkflowStepAllowedActionScalarFieldEnum];
export declare const WorkflowStepDependencyScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly id: "id";
    readonly workflowStepId: "workflowStepId";
    readonly dependsOnStepId: "dependsOnStepId";
    readonly createdBy: "createdBy";
};
export type WorkflowStepDependencyScalarFieldEnum = (typeof WorkflowStepDependencyScalarFieldEnum)[keyof typeof WorkflowStepDependencyScalarFieldEnum];
export declare const RequestScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly version: "version";
    readonly referenceNo: "referenceNo";
    readonly requesterId: "requesterId";
    readonly rawText: "rawText";
    readonly templateId: "templateId";
    readonly workflowPathId: "workflowPathId";
    readonly filledData: "filledData";
    readonly classificationStatus: "classificationStatus";
    readonly classificationConfidence: "classificationConfidence";
    readonly classifiedBy: "classifiedBy";
    readonly currentStatus: "currentStatus";
    readonly priority: "priority";
    readonly slaRisk: "slaRisk";
    readonly slaDueAt: "slaDueAt";
    readonly createdAt: "createdAt";
    readonly completedAt: "completedAt";
    readonly confirmedAt: "confirmedAt";
    readonly extractionAttemptedAt: "extractionAttemptedAt";
    readonly businessDurationMinutes: "businessDurationMinutes";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type RequestScalarFieldEnum = (typeof RequestScalarFieldEnum)[keyof typeof RequestScalarFieldEnum];
export declare const RequestStepInstanceScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly requestId: "requestId";
    readonly workflowStepId: "workflowStepId";
    readonly assignedToUserId: "assignedToUserId";
    readonly status: "status";
    readonly slaDueAt: "slaDueAt";
    readonly slaPaused: "slaPaused";
    readonly startedAt: "startedAt";
    readonly completedAt: "completedAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type RequestStepInstanceScalarFieldEnum = (typeof RequestStepInstanceScalarFieldEnum)[keyof typeof RequestStepInstanceScalarFieldEnum];
export declare const RequestActionScalarFieldEnum: {
    readonly id: "id";
    readonly requestId: "requestId";
    readonly requestStepInstanceId: "requestStepInstanceId";
    readonly actorId: "actorId";
    readonly actionTypeId: "actionTypeId";
    readonly comment: "comment";
    readonly createdAt: "createdAt";
    readonly createdBy: "createdBy";
};
export type RequestActionScalarFieldEnum = (typeof RequestActionScalarFieldEnum)[keyof typeof RequestActionScalarFieldEnum];
export declare const PaymentScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly requestId: "requestId";
    readonly requestStepInstanceId: "requestStepInstanceId";
    readonly amount: "amount";
    readonly currency: "currency";
    readonly status: "status";
    readonly requestedBy: "requestedBy";
    readonly settledBy: "settledBy";
    readonly requestedAt: "requestedAt";
    readonly settledAt: "settledAt";
    readonly waiverReason: "waiverReason";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type PaymentScalarFieldEnum = (typeof PaymentScalarFieldEnum)[keyof typeof PaymentScalarFieldEnum];
export declare const DocumentScalarFieldEnum: {
    readonly id: "id";
    readonly requestId: "requestId";
    readonly requestActionId: "requestActionId";
    readonly uploaderId: "uploaderId";
    readonly docKind: "docKind";
    readonly storageKey: "storageKey";
    readonly fileName: "fileName";
    readonly mimeType: "mimeType";
    readonly fileSize: "fileSize";
    readonly ocrText: "ocrText";
    readonly uploadedAt: "uploadedAt";
};
export type DocumentScalarFieldEnum = (typeof DocumentScalarFieldEnum)[keyof typeof DocumentScalarFieldEnum];
export declare const AcademicCalendarScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly name: "name";
    readonly periodType: "periodType";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly description: "description";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type AcademicCalendarScalarFieldEnum = (typeof AcademicCalendarScalarFieldEnum)[keyof typeof AcademicCalendarScalarFieldEnum];
export declare const EventLogScalarFieldEnum: {
    readonly id: "id";
    readonly requestId: "requestId";
    readonly requestStepInstanceId: "requestStepInstanceId";
    readonly actorId: "actorId";
    readonly actionTypeId: "actionTypeId";
    readonly eventType: "eventType";
    readonly fromStatus: "fromStatus";
    readonly toStatus: "toStatus";
    readonly ipAddress: "ipAddress";
    readonly occurredAt: "occurredAt";
};
export type EventLogScalarFieldEnum = (typeof EventLogScalarFieldEnum)[keyof typeof EventLogScalarFieldEnum];
export declare const NotificationScalarFieldEnum: {
    readonly updatedAt: "updatedAt";
    readonly id: "id";
    readonly userId: "userId";
    readonly requestId: "requestId";
    readonly type: "type";
    readonly title: "title";
    readonly body: "body";
    readonly isRead: "isRead";
    readonly createdAt: "createdAt";
    readonly createdBy: "createdBy";
    readonly updatedBy: "updatedBy";
};
export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum];
export declare const MlPredictionScalarFieldEnum: {
    readonly id: "id";
    readonly requestId: "requestId";
    readonly modelType: "modelType";
    readonly fieldKey: "fieldKey";
    readonly modelVersion: "modelVersion";
    readonly predictedValue: "predictedValue";
    readonly confidence: "confidence";
    readonly createdAt: "createdAt";
    readonly createdBy: "createdBy";
};
export type MlPredictionScalarFieldEnum = (typeof MlPredictionScalarFieldEnum)[keyof typeof MlPredictionScalarFieldEnum];
export declare const SystemSettingScalarFieldEnum: {
    readonly createdAt: "createdAt";
    readonly id: "id";
    readonly key: "key";
    readonly value: "value";
    readonly description: "description";
    readonly updatedAt: "updatedAt";
    readonly updatedBy: "updatedBy";
    readonly createdBy: "createdBy";
};
export type SystemSettingScalarFieldEnum = (typeof SystemSettingScalarFieldEnum)[keyof typeof SystemSettingScalarFieldEnum];
export declare const RequestNumberSequenceScalarFieldEnum: {
    readonly scope: "scope";
    readonly currentValue: "currentValue";
    readonly updatedAt: "updatedAt";
    readonly updatedBy: "updatedBy";
};
export type RequestNumberSequenceScalarFieldEnum = (typeof RequestNumberSequenceScalarFieldEnum)[keyof typeof RequestNumberSequenceScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>;
export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>;
export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>;
export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export interface PrismaClientBaseOptions {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
}
export interface PrismaClientOptionsWithAccelerateUrl extends PrismaClientBaseOptions {
    accelerateUrl: string;
    adapter?: never;
}
export interface PrismaClientOptionsWithAdapter extends PrismaClientBaseOptions {
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
}
export type PrismaClientOptions = PrismaClientOptionsWithAccelerateUrl | PrismaClientOptionsWithAdapter;
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    attributeDefinition?: Prisma.AttributeDefinitionOmit;
    attributeOption?: Prisma.AttributeOptionOmit;
    userAttribute?: Prisma.UserAttributeOmit;
    role?: Prisma.RoleOmit;
    permissionGroup?: Prisma.PermissionGroupOmit;
    permission?: Prisma.PermissionOmit;
    rolePermission?: Prisma.RolePermissionOmit;
    userRole?: Prisma.UserRoleOmit;
    delegation?: Prisma.DelegationOmit;
    orgUnitType?: Prisma.OrgUnitTypeOmit;
    department?: Prisma.DepartmentOmit;
    language?: Prisma.LanguageOmit;
    sensitivityLevel?: Prisma.SensitivityLevelOmit;
    requestCategory?: Prisma.RequestCategoryOmit;
    template?: Prisma.TemplateOmit;
    templateField?: Prisma.TemplateFieldOmit;
    templateFieldOption?: Prisma.TemplateFieldOptionOmit;
    templateEligibilityRule?: Prisma.TemplateEligibilityRuleOmit;
    actionType?: Prisma.ActionTypeOmit;
    workflowPath?: Prisma.WorkflowPathOmit;
    workflowStep?: Prisma.WorkflowStepOmit;
    workflowStepAllowedAction?: Prisma.WorkflowStepAllowedActionOmit;
    workflowStepDependency?: Prisma.WorkflowStepDependencyOmit;
    request?: Prisma.RequestOmit;
    requestStepInstance?: Prisma.RequestStepInstanceOmit;
    requestAction?: Prisma.RequestActionOmit;
    payment?: Prisma.PaymentOmit;
    document?: Prisma.DocumentOmit;
    academicCalendar?: Prisma.AcademicCalendarOmit;
    eventLog?: Prisma.EventLogOmit;
    notification?: Prisma.NotificationOmit;
    mlPrediction?: Prisma.MlPredictionOmit;
    systemSetting?: Prisma.SystemSettingOmit;
    requestNumberSequence?: Prisma.RequestNumberSequenceOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;

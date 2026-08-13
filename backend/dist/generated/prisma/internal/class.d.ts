import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace.js";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.PrismaClientConstructorArgs<Options>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = Prisma.PrismaClientOptions['omit'], in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    $connect(): runtime.Types.Utils.JsPromise<void>;
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    get user(): Prisma.UserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get attributeDefinition(): Prisma.AttributeDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get attributeOption(): Prisma.AttributeOptionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get userAttribute(): Prisma.UserAttributeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get role(): Prisma.RoleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get permissionGroup(): Prisma.PermissionGroupDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get permission(): Prisma.PermissionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get rolePermission(): Prisma.RolePermissionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get userRole(): Prisma.UserRoleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get delegation(): Prisma.DelegationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get orgUnitType(): Prisma.OrgUnitTypeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get department(): Prisma.DepartmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get language(): Prisma.LanguageDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get sensitivityLevel(): Prisma.SensitivityLevelDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get requestCategory(): Prisma.RequestCategoryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get template(): Prisma.TemplateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get templateField(): Prisma.TemplateFieldDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get templateFieldOption(): Prisma.TemplateFieldOptionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get templateEligibilityRule(): Prisma.TemplateEligibilityRuleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get actionType(): Prisma.ActionTypeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get workflowPath(): Prisma.WorkflowPathDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get workflowStep(): Prisma.WorkflowStepDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get workflowStepAllowedAction(): Prisma.WorkflowStepAllowedActionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get workflowStepDependency(): Prisma.WorkflowStepDependencyDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get request(): Prisma.RequestDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get requestStepInstance(): Prisma.RequestStepInstanceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get requestAction(): Prisma.RequestActionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get payment(): Prisma.PaymentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get document(): Prisma.DocumentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get academicCalendar(): Prisma.AcademicCalendarDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get eventLog(): Prisma.EventLogDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get notification(): Prisma.NotificationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get mlPrediction(): Prisma.MlPredictionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get systemSetting(): Prisma.SystemSettingDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    get requestNumberSequence(): Prisma.RequestNumberSequenceDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;

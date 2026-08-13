"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonNullValueFilter = exports.NullsOrder = exports.QueryMode = exports.NullableJsonNullValueInput = exports.JsonNullValueInput = exports.SortOrder = exports.RequestNumberSequenceScalarFieldEnum = exports.SystemSettingScalarFieldEnum = exports.MlPredictionScalarFieldEnum = exports.NotificationScalarFieldEnum = exports.EventLogScalarFieldEnum = exports.AcademicCalendarScalarFieldEnum = exports.DocumentScalarFieldEnum = exports.PaymentScalarFieldEnum = exports.RequestActionScalarFieldEnum = exports.RequestStepInstanceScalarFieldEnum = exports.RequestScalarFieldEnum = exports.WorkflowStepDependencyScalarFieldEnum = exports.WorkflowStepAllowedActionScalarFieldEnum = exports.WorkflowStepScalarFieldEnum = exports.WorkflowPathScalarFieldEnum = exports.ActionTypeScalarFieldEnum = exports.TemplateEligibilityRuleScalarFieldEnum = exports.TemplateFieldOptionScalarFieldEnum = exports.TemplateFieldScalarFieldEnum = exports.TemplateScalarFieldEnum = exports.RequestCategoryScalarFieldEnum = exports.SensitivityLevelScalarFieldEnum = exports.LanguageScalarFieldEnum = exports.DepartmentScalarFieldEnum = exports.OrgUnitTypeScalarFieldEnum = exports.DelegationScalarFieldEnum = exports.UserRoleScalarFieldEnum = exports.RolePermissionScalarFieldEnum = exports.PermissionScalarFieldEnum = exports.PermissionGroupScalarFieldEnum = exports.RoleScalarFieldEnum = exports.UserAttributeScalarFieldEnum = exports.AttributeOptionScalarFieldEnum = exports.AttributeDefinitionScalarFieldEnum = exports.UserScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.Decimal = void 0;
const runtime = __importStar(require("@prisma/client/runtime/index-browser"));
exports.Decimal = runtime.Decimal;
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    User: 'User',
    AttributeDefinition: 'AttributeDefinition',
    AttributeOption: 'AttributeOption',
    UserAttribute: 'UserAttribute',
    Role: 'Role',
    PermissionGroup: 'PermissionGroup',
    Permission: 'Permission',
    RolePermission: 'RolePermission',
    UserRole: 'UserRole',
    Delegation: 'Delegation',
    OrgUnitType: 'OrgUnitType',
    Department: 'Department',
    Language: 'Language',
    SensitivityLevel: 'SensitivityLevel',
    RequestCategory: 'RequestCategory',
    Template: 'Template',
    TemplateField: 'TemplateField',
    TemplateFieldOption: 'TemplateFieldOption',
    TemplateEligibilityRule: 'TemplateEligibilityRule',
    ActionType: 'ActionType',
    WorkflowPath: 'WorkflowPath',
    WorkflowStep: 'WorkflowStep',
    WorkflowStepAllowedAction: 'WorkflowStepAllowedAction',
    WorkflowStepDependency: 'WorkflowStepDependency',
    Request: 'Request',
    RequestStepInstance: 'RequestStepInstance',
    RequestAction: 'RequestAction',
    Payment: 'Payment',
    Document: 'Document',
    AcademicCalendar: 'AcademicCalendar',
    EventLog: 'EventLog',
    Notification: 'Notification',
    MlPrediction: 'MlPrediction',
    SystemSetting: 'SystemSetting',
    RequestNumberSequence: 'RequestNumberSequence'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.UserScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    userType: 'userType',
    fullNameAr: 'fullNameAr',
    fullNameEn: 'fullNameEn',
    institutionalNumber: 'institutionalNumber',
    email: 'email',
    phone: 'phone',
    passwordHash: 'passwordHash',
    authProvider: 'authProvider',
    applicantPurpose: 'applicantPurpose',
    departmentId: 'departmentId',
    preferredLang: 'preferredLang',
    signatureKey: 'signatureKey',
    status: 'status',
    createdAt: 'createdAt',
    lastSyncedAt: 'lastSyncedAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.AttributeDefinitionScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    code: 'code',
    label: 'label',
    dataType: 'dataType',
    description: 'description',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.AttributeOptionScalarFieldEnum = {
    id: 'id',
    attributeId: 'attributeId',
    value: 'value',
    label: 'label',
    ordinal: 'ordinal',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.UserAttributeScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    userId: 'userId',
    attributeId: 'attributeId',
    value: 'value',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.RoleScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    name: 'name',
    description: 'description',
    isSystem: 'isSystem',
    createdAt: 'createdAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.PermissionGroupScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    name: 'name',
    description: 'description',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.PermissionScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    groupId: 'groupId',
    code: 'code',
    name: 'name',
    description: 'description',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.RolePermissionScalarFieldEnum = {
    createdAt: 'createdAt',
    id: 'id',
    roleId: 'roleId',
    permissionId: 'permissionId',
    createdBy: 'createdBy'
};
exports.UserRoleScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    roleId: 'roleId',
    departmentId: 'departmentId',
    reason: 'reason',
    expiresAt: 'expiresAt',
    assignedBy: 'assignedBy',
    assignedAt: 'assignedAt'
};
exports.DelegationScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    delegatorId: 'delegatorId',
    delegateId: 'delegateId',
    startDate: 'startDate',
    endDate: 'endDate',
    reason: 'reason',
    isActive: 'isActive',
    createdAt: 'createdAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.OrgUnitTypeScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    code: 'code',
    name: 'name',
    description: 'description',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.DepartmentScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    parentId: 'parentId',
    unitTypeId: 'unitTypeId',
    name: 'name',
    description: 'description',
    isActive: 'isActive',
    externalId: 'externalId',
    sourceSystem: 'sourceSystem',
    lastSyncedAt: 'lastSyncedAt',
    createdAt: 'createdAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.LanguageScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    code: 'code',
    name: 'name',
    nativeName: 'nativeName',
    isEnabled: 'isEnabled',
    isDefault: 'isDefault',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.SensitivityLevelScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    name: 'name',
    rank: 'rank',
    description: 'description',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.RequestCategoryScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    name: 'name',
    description: 'description',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.TemplateScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    code: 'code',
    categoryId: 'categoryId',
    title: 'title',
    description: 'description',
    classifierDocument: 'classifierDocument',
    sensitivityLevelId: 'sensitivityLevelId',
    defaultPriority: 'defaultPriority',
    isActive: 'isActive',
    createdAt: 'createdAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.TemplateFieldScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    templateId: 'templateId',
    fieldKey: 'fieldKey',
    label: 'label',
    extractionQuestion: 'extractionQuestion',
    dataType: 'dataType',
    isRequired: 'isRequired',
    ordinal: 'ordinal',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.TemplateFieldOptionScalarFieldEnum = {
    id: 'id',
    templateFieldId: 'templateFieldId',
    value: 'value',
    label: 'label',
    ordinal: 'ordinal',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.TemplateEligibilityRuleScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    templateId: 'templateId',
    attributeId: 'attributeId',
    operator: 'operator',
    value: 'value',
    description: 'description',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.ActionTypeScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    code: 'code',
    name: 'name',
    isTerminal: 'isTerminal',
    description: 'description',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.WorkflowPathScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    templateId: 'templateId',
    name: 'name',
    description: 'description',
    isActive: 'isActive',
    createdAt: 'createdAt',
    deletedAt: 'deletedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.WorkflowStepScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    workflowPathId: 'workflowPathId',
    name: 'name',
    description: 'description',
    assigneeType: 'assigneeType',
    assigneeRoleId: 'assigneeRoleId',
    assigneeDepartmentId: 'assigneeDepartmentId',
    defaultActionTypeId: 'defaultActionTypeId',
    slaHours: 'slaHours',
    pausesSla: 'pausesSla',
    feeAmount: 'feeAmount',
    feeCurrency: 'feeCurrency',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.WorkflowStepAllowedActionScalarFieldEnum = {
    createdAt: 'createdAt',
    id: 'id',
    workflowStepId: 'workflowStepId',
    actionTypeId: 'actionTypeId',
    createdBy: 'createdBy'
};
exports.WorkflowStepDependencyScalarFieldEnum = {
    createdAt: 'createdAt',
    id: 'id',
    workflowStepId: 'workflowStepId',
    dependsOnStepId: 'dependsOnStepId',
    createdBy: 'createdBy'
};
exports.RequestScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    version: 'version',
    referenceNo: 'referenceNo',
    requesterId: 'requesterId',
    rawText: 'rawText',
    templateId: 'templateId',
    workflowPathId: 'workflowPathId',
    filledData: 'filledData',
    classificationStatus: 'classificationStatus',
    classificationConfidence: 'classificationConfidence',
    classifiedBy: 'classifiedBy',
    currentStatus: 'currentStatus',
    priority: 'priority',
    slaRisk: 'slaRisk',
    slaDueAt: 'slaDueAt',
    createdAt: 'createdAt',
    completedAt: 'completedAt',
    confirmedAt: 'confirmedAt',
    extractionAttemptedAt: 'extractionAttemptedAt',
    businessDurationMinutes: 'businessDurationMinutes',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.RequestStepInstanceScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    requestId: 'requestId',
    workflowStepId: 'workflowStepId',
    assignedToUserId: 'assignedToUserId',
    status: 'status',
    slaDueAt: 'slaDueAt',
    slaPaused: 'slaPaused',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.RequestActionScalarFieldEnum = {
    id: 'id',
    requestId: 'requestId',
    requestStepInstanceId: 'requestStepInstanceId',
    actorId: 'actorId',
    actionTypeId: 'actionTypeId',
    comment: 'comment',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
};
exports.PaymentScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    requestId: 'requestId',
    requestStepInstanceId: 'requestStepInstanceId',
    amount: 'amount',
    currency: 'currency',
    status: 'status',
    requestedBy: 'requestedBy',
    settledBy: 'settledBy',
    requestedAt: 'requestedAt',
    settledAt: 'settledAt',
    waiverReason: 'waiverReason',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.DocumentScalarFieldEnum = {
    id: 'id',
    requestId: 'requestId',
    requestActionId: 'requestActionId',
    uploaderId: 'uploaderId',
    docKind: 'docKind',
    storageKey: 'storageKey',
    fileName: 'fileName',
    mimeType: 'mimeType',
    fileSize: 'fileSize',
    ocrText: 'ocrText',
    uploadedAt: 'uploadedAt'
};
exports.AcademicCalendarScalarFieldEnum = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    id: 'id',
    name: 'name',
    periodType: 'periodType',
    startDate: 'startDate',
    endDate: 'endDate',
    description: 'description',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.EventLogScalarFieldEnum = {
    id: 'id',
    requestId: 'requestId',
    requestStepInstanceId: 'requestStepInstanceId',
    actorId: 'actorId',
    actionTypeId: 'actionTypeId',
    eventType: 'eventType',
    fromStatus: 'fromStatus',
    toStatus: 'toStatus',
    ipAddress: 'ipAddress',
    occurredAt: 'occurredAt'
};
exports.NotificationScalarFieldEnum = {
    updatedAt: 'updatedAt',
    id: 'id',
    userId: 'userId',
    requestId: 'requestId',
    type: 'type',
    title: 'title',
    body: 'body',
    isRead: 'isRead',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    updatedBy: 'updatedBy'
};
exports.MlPredictionScalarFieldEnum = {
    id: 'id',
    requestId: 'requestId',
    modelType: 'modelType',
    fieldKey: 'fieldKey',
    modelVersion: 'modelVersion',
    predictedValue: 'predictedValue',
    confidence: 'confidence',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
};
exports.SystemSettingScalarFieldEnum = {
    createdAt: 'createdAt',
    id: 'id',
    key: 'key',
    value: 'value',
    description: 'description',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy',
    createdBy: 'createdBy'
};
exports.RequestNumberSequenceScalarFieldEnum = {
    scope: 'scope',
    currentValue: 'currentValue',
    updatedAt: 'updatedAt',
    updatedBy: 'updatedBy'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.JsonNullValueInput = {
    JsonNull: exports.JsonNull
};
exports.NullableJsonNullValueInput = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.JsonNullValueFilter = {
    DbNull: exports.DbNull,
    JsonNull: exports.JsonNull,
    AnyNull: exports.AnyNull
};
//# sourceMappingURL=prismaNamespaceBrowser.js.map
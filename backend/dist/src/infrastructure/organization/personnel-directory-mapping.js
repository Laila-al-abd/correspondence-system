"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMapping = parseMapping;
exports.readPath = readPath;
exports.extractRecords = extractRecords;
exports.toExternalOrgUnit = toExternalOrgUnit;
exports.toExternalUser = toExternalUser;
const yaml_1 = require("yaml");
function parseMapping(yamlText) {
    const raw = (0, yaml_1.parse)(yamlText);
    if (!raw || typeof raw !== 'object')
        throw new Error('Personnel directory mapping is empty or not an object.');
    const fields = raw.fields;
    if (!fields || !fields.externalId || !fields.nameAr || !fields.unitType)
        throw new Error('Personnel directory mapping must define fields.externalId, fields.nameAr and fields.unitType.');
    return {
        recordsPath: raw.recordsPath,
        fields: {
            externalId: fields.externalId,
            parentExternalId: fields.parentExternalId,
            nameAr: fields.nameAr,
            nameEn: fields.nameEn,
            unitType: fields.unitType,
        },
        unitTypeMap: raw.unitTypeMap ?? {},
        users: raw.users ? parseUserMapping(raw.users) : undefined,
    };
}
function parseUserMapping(raw) {
    const fields = raw.fields;
    if (!fields ||
        !fields.institutionalNumber ||
        !fields.fullNameAr ||
        !fields.email ||
        !fields.userType)
        throw new Error('Personnel directory users mapping must define fields.institutionalNumber, ' +
            'fields.fullNameAr, fields.email and fields.userType.');
    return {
        endpoint: raw.endpoint,
        recordsPath: raw.recordsPath,
        fields: {
            institutionalNumber: fields.institutionalNumber,
            fullNameAr: fields.fullNameAr,
            fullNameEn: fields.fullNameEn,
            email: fields.email,
            phone: fields.phone,
            userType: fields.userType,
            departmentExternalId: fields.departmentExternalId,
        },
        userTypeMap: raw.userTypeMap ?? {},
    };
}
function readPath(source, path) {
    return path.split('.').reduce((value, key) => {
        if (value && typeof value === 'object')
            return value[key];
        return undefined;
    }, source);
}
function readString(record, path) {
    const value = readPath(record, path);
    if (value === undefined || value === null)
        return undefined;
    return String(value);
}
function extractRecords(payload, mapping) {
    const container = mapping.recordsPath
        ? readPath(payload, mapping.recordsPath)
        : payload;
    if (!Array.isArray(container))
        throw new Error(mapping.recordsPath
            ? `Personnel directory response has no array at '${mapping.recordsPath}'.`
            : 'Personnel directory response is not an array.');
    return container;
}
function toExternalOrgUnit(record, mapping) {
    const { fields, unitTypeMap } = mapping;
    const externalId = readString(record, fields.externalId);
    if (!externalId)
        throw new Error('A personnel directory record is missing its external id.');
    const nameAr = readString(record, fields.nameAr);
    if (!nameAr)
        throw new Error(`Record '${externalId}' is missing its Arabic name.`);
    const nameEn = fields.nameEn ? readString(record, fields.nameEn) : undefined;
    const parentExternalId = fields.parentExternalId
        ? (readString(record, fields.parentExternalId) ?? null)
        : null;
    const rawUnitType = readString(record, fields.unitType);
    if (!rawUnitType)
        throw new Error(`Record '${externalId}' is missing its unit type.`);
    const unitType = unitTypeMap?.[rawUnitType] ?? rawUnitType;
    return {
        externalId,
        parentExternalId,
        name: nameEn ? { ar: nameAr, en: nameEn } : { ar: nameAr },
        unitType,
    };
}
function toExternalUser(record, mapping) {
    const { fields, userTypeMap } = mapping;
    const institutionalNumber = readString(record, fields.institutionalNumber);
    if (!institutionalNumber)
        throw new Error('A personnel directory person record is missing its institutional number.');
    const nameAr = readString(record, fields.fullNameAr);
    if (!nameAr)
        throw new Error(`Person '${institutionalNumber}' is missing an Arabic name.`);
    const email = readString(record, fields.email);
    if (!email)
        throw new Error(`Person '${institutionalNumber}' is missing an email address.`);
    const nameEn = fields.fullNameEn
        ? readString(record, fields.fullNameEn)
        : undefined;
    const rawUserType = readString(record, fields.userType);
    if (!rawUserType)
        throw new Error(`Person '${institutionalNumber}' is missing a user type.`);
    return {
        institutionalNumber,
        name: nameEn ? { ar: nameAr, en: nameEn } : { ar: nameAr },
        email,
        phone: fields.phone ? readString(record, fields.phone) : undefined,
        userType: userTypeMap?.[rawUserType] ?? rawUserType,
        departmentExternalId: fields.departmentExternalId
            ? (readString(record, fields.departmentExternalId) ?? null)
            : null,
    };
}
//# sourceMappingURL=personnel-directory-mapping.js.map
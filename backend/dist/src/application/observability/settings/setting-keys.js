"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTING_DEFINITIONS = exports.REQUEST_NUMBERING_SETTING_KEY = void 0;
exports.settingDefinition = settingDefinition;
const domain_error_1 = require("../../../domain/shared/domain-error");
const numbering_scheme_1 = require("../../../domain/request/value-objects/numbering-scheme");
const errors_1 = require("../../errors");
const business_hours_service_1 = require("../services/business-hours.service");
exports.REQUEST_NUMBERING_SETTING_KEY = 'request_numbering';
const DEFAULT_NUMBERING = {
    pattern: '{prefix}-{year}-{seq}',
    prefix: 'REQ',
    seqPadding: 5,
    resetPolicy: 'YEARLY',
    yearDigits: 4,
};
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
function asRecord(value, key) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        throw new domain_error_1.InvariantViolationError(`The "${key}" setting must be a JSON object.`);
    return value;
}
function minutesOf(time, field) {
    const match = TIME_PATTERN.exec(time);
    if (!match)
        throw new domain_error_1.InvariantViolationError(`"${field}" must be a 24-hour time such as "08:00".`);
    return Number(match[1]) * 60 + Number(match[2]);
}
function validateWorkingHours(value) {
    const raw = asRecord(value, business_hours_service_1.WORKING_HOURS_SETTING_KEY);
    if ('enabled' in raw && typeof raw.enabled !== 'boolean')
        throw new domain_error_1.InvariantViolationError('"enabled" must be true or false.');
    if ('days' in raw) {
        const days = raw.days;
        if (!Array.isArray(days) || days.length === 0)
            throw new domain_error_1.InvariantViolationError('"days" must be a non-empty array of weekday numbers, where 0 is Sunday.');
        for (const day of days) {
            if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 6)
                throw new domain_error_1.InvariantViolationError('"days" may only contain whole numbers from 0 (Sunday) to 6 (Saturday).');
        }
        if (new Set(days).size !== days.length)
            throw new domain_error_1.InvariantViolationError('"days" may not repeat a weekday.');
    }
    const start = 'start' in raw ? raw.start : business_hours_service_1.DEFAULT_POLICY.start;
    const end = 'end' in raw ? raw.end : business_hours_service_1.DEFAULT_POLICY.end;
    if (typeof start !== 'string' || typeof end !== 'string')
        throw new domain_error_1.InvariantViolationError('"start" and "end" must be strings such as "08:00".');
    if (minutesOf(start, 'start') >= minutesOf(end, 'end'))
        throw new domain_error_1.InvariantViolationError('"start" must be earlier than "end" on the same day.');
    if ('timezone' in raw) {
        const timezone = raw.timezone;
        if (typeof timezone !== 'string' || timezone.trim().length === 0)
            throw new domain_error_1.InvariantViolationError('"timezone" must be an IANA name such as "Asia/Damascus".');
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        }
        catch {
            throw new domain_error_1.InvariantViolationError(`Unknown timezone "${timezone}". Use an IANA name such as "Asia/Damascus".`);
        }
    }
}
function validateNumbering(value) {
    const raw = asRecord(value, exports.REQUEST_NUMBERING_SETTING_KEY);
    numbering_scheme_1.NumberingScheme.create(raw);
}
exports.SETTING_DEFINITIONS = [
    {
        key: business_hours_service_1.WORKING_HOURS_SETTING_KEY,
        description: 'Weekly working schedule used for SLA due dates, the working-hours guard, and recorded durations.',
        defaultValue: business_hours_service_1.DEFAULT_POLICY,
        validate: validateWorkingHours,
        invalidatesWorkingHours: true,
    },
    {
        key: exports.REQUEST_NUMBERING_SETTING_KEY,
        description: 'Format of human-readable request reference numbers, e.g. REQ-2026-00042.',
        defaultValue: DEFAULT_NUMBERING,
        validate: validateNumbering,
        invalidatesWorkingHours: false,
    },
];
function settingDefinition(key) {
    const wanted = key.trim();
    const found = exports.SETTING_DEFINITIONS.find((definition) => definition.key === wanted);
    if (!found)
        throw new errors_1.EntityNotFoundError('Setting', key);
    return found;
}
//# sourceMappingURL=setting-keys.js.map
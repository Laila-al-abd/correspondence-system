"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BusinessHoursService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessHoursService = exports.DEFAULT_POLICY = exports.WORKING_HOURS_SETTING_KEY = void 0;
exports.describeDays = describeDays;
const common_1 = require("@nestjs/common");
const tokens_1 = require("../../tokens");
exports.WORKING_HOURS_SETTING_KEY = 'working_hours';
exports.DEFAULT_POLICY = {
    enabled: true,
    days: [0, 1, 2, 3, 4],
    start: '08:00',
    end: '15:30',
    timezone: 'Asia/Damascus',
};
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const POLICY_CACHE_MS = 60 * 1000;
const MAX_DAY_STEPS = 400;
let BusinessHoursService = BusinessHoursService_1 = class BusinessHoursService {
    settings;
    calendar;
    logger = new common_1.Logger(BusinessHoursService_1.name);
    cached;
    constructor(settings, calendar) {
        this.settings = settings;
        this.calendar = calendar;
    }
    async policy() {
        const now = Date.now();
        if (this.cached && now - this.cached.readAt < POLICY_CACHE_MS)
            return this.cached.policy;
        let policy = exports.DEFAULT_POLICY;
        try {
            const setting = await this.settings.findByKey(exports.WORKING_HOURS_SETTING_KEY);
            if (setting)
                policy = this.merge(setting.value);
        }
        catch (error) {
            this.logger.warn(`Could not read the working-hours policy, using defaults: ${describe(error)}`);
        }
        this.cached = { policy, readAt: now };
        return policy;
    }
    invalidate() {
        this.cached = undefined;
    }
    async isWorkingMoment(at) {
        const policy = await this.policy();
        if (!policy.enabled)
            return true;
        const window = await this.windowFor(this.dateIn(at, policy.timezone), policy);
        if (!window)
            return false;
        return at.getTime() >= window.start.getTime() && at.getTime() < window.end.getTime();
    }
    async nextWorkingMoment(at) {
        const policy = await this.policy();
        if (!policy.enabled)
            return at;
        let date = this.dateIn(at, policy.timezone);
        for (let step = 0; step < MAX_DAY_STEPS; step++) {
            const window = await this.windowFor(date, policy);
            if (window && at.getTime() < window.end.getTime())
                return at.getTime() >= window.start.getTime() ? at : window.start;
            date = nextDate(date);
        }
        this.logger.warn('No working day found within a year; check the working-hours policy.');
        return at;
    }
    async addWorkingHours(from, hours) {
        const policy = await this.policy();
        if (!policy.enabled || hours <= 0)
            return new Date(from.getTime() + hours * MS_PER_HOUR);
        let remaining = hours * MS_PER_HOUR;
        let cursor = from;
        let date = this.dateIn(from, policy.timezone);
        for (let step = 0; step < MAX_DAY_STEPS; step++) {
            const window = await this.windowFor(date, policy);
            if (window && cursor.getTime() < window.end.getTime()) {
                const opensAt = Math.max(cursor.getTime(), window.start.getTime());
                const available = window.end.getTime() - opensAt;
                if (available >= remaining)
                    return new Date(opensAt + remaining);
                remaining -= available;
            }
            date = nextDate(date);
            cursor = this.startOfDate(date, policy.timezone);
        }
        this.logger.warn(`Could not place a due date ${hours}h ahead within a year of working days; falling back to wall-clock time.`);
        return new Date(from.getTime() + hours * MS_PER_HOUR);
    }
    async workingHoursBetween(from, to) {
        if (to.getTime() <= from.getTime())
            return 0;
        const policy = await this.policy();
        if (!policy.enabled)
            return (to.getTime() - from.getTime()) / MS_PER_HOUR;
        let total = 0;
        let date = this.dateIn(from, policy.timezone);
        for (let step = 0; step < MAX_DAY_STEPS; step++) {
            const window = await this.windowFor(date, policy);
            if (window) {
                const overlapStart = Math.max(from.getTime(), window.start.getTime());
                const overlapEnd = Math.min(to.getTime(), window.end.getTime());
                if (overlapEnd > overlapStart)
                    total += overlapEnd - overlapStart;
            }
            const dayStart = this.startOfDate(date, policy.timezone).getTime();
            if (dayStart > to.getTime())
                break;
            date = nextDate(date);
        }
        return total / MS_PER_HOUR;
    }
    async windowFor(date, policy) {
        if (!policy.days.includes(weekdayOf(date)))
            return null;
        if (await this.isHoliday(date))
            return null;
        const startMinutes = minutesOfDay(policy.start, 8 * 60);
        const endMinutes = minutesOfDay(policy.end, 15 * 60 + 30);
        if (endMinutes <= startMinutes)
            return null;
        return {
            start: this.instantAt(date, startMinutes, policy.timezone),
            end: this.instantAt(date, endMinutes, policy.timezone),
        };
    }
    async isHoliday(date) {
        try {
            const periods = await this.calendar.findPeriodsOn(utcMidnight(date));
            return periods.some((period) => !period.isWorkingPeriod());
        }
        catch (error) {
            this.logger.warn(`Calendar lookup failed: ${describe(error)}`);
            return false;
        }
    }
    dateIn(at, timezone) {
        const parts = localParts(at, timezone);
        return { year: parts.year, month: parts.month, day: parts.day };
    }
    instantAt(date, minutes, timezone) {
        const naive = utcMidnight(date).getTime() + minutes * MS_PER_MINUTE;
        const first = naive - offsetMs(new Date(naive), timezone);
        const second = naive - offsetMs(new Date(first), timezone);
        return new Date(second);
    }
    startOfDate(date, timezone) {
        return this.instantAt(date, 0, timezone);
    }
    merge(value) {
        if (typeof value !== 'object' || value === null)
            return exports.DEFAULT_POLICY;
        const raw = value;
        const days = Array.isArray(raw.days)
            ? raw.days.filter((day) => typeof day === 'number' && Number.isInteger(day) && day >= 0 && day <= 6)
            : [];
        return {
            enabled: typeof raw.enabled === 'boolean' ? raw.enabled : exports.DEFAULT_POLICY.enabled,
            days: days.length > 0 ? days : exports.DEFAULT_POLICY.days,
            start: typeof raw.start === 'string' ? raw.start : exports.DEFAULT_POLICY.start,
            end: typeof raw.end === 'string' ? raw.end : exports.DEFAULT_POLICY.end,
            timezone: typeof raw.timezone === 'string' && raw.timezone.length > 0
                ? raw.timezone
                : exports.DEFAULT_POLICY.timezone,
        };
    }
};
exports.BusinessHoursService = BusinessHoursService;
exports.BusinessHoursService = BusinessHoursService = BusinessHoursService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tokens_1.SYSTEM_SETTING_REPOSITORY)),
    __param(1, (0, common_1.Inject)(tokens_1.ACADEMIC_CALENDAR_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], BusinessHoursService);
const WEEKDAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
function describeDays(days) {
    const named = days
        .filter((day) => day >= 0 && day <= 6)
        .sort((a, b) => a - b)
        .map((day) => WEEKDAY_NAMES[day]);
    if (named.length === 0)
        return 'no days';
    if (named.length === 1)
        return named[0];
    return `${named[0]}-${named[named.length - 1]}`;
}
function utcMidnight(date) {
    return new Date(Date.UTC(date.year, date.month - 1, date.day));
}
function weekdayOf(date) {
    return utcMidnight(date).getUTCDay();
}
function nextDate(date) {
    const next = new Date(utcMidnight(date).getTime() + MS_PER_DAY);
    return {
        year: next.getUTCFullYear(),
        month: next.getUTCMonth() + 1,
        day: next.getUTCDate(),
    };
}
function minutesOfDay(value, fallback) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match)
        return fallback;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59)
        return fallback;
    return hours * 60 + minutes;
}
function localParts(at, timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const found = new Map(formatter.formatToParts(at).map((part) => [part.type, part.value]));
    const read = (type) => Number(found.get(type) ?? '0');
    return {
        year: read('year'),
        month: read('month'),
        day: read('day'),
        hour: read('hour'),
        minute: read('minute'),
        second: read('second'),
    };
}
function offsetMs(at, timezone) {
    const whole = Math.floor(at.getTime() / 1000) * 1000;
    const parts = localParts(new Date(whole), timezone);
    const asIfUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    return asIfUtc - whole;
}
function describe(error) {
    return error instanceof Error ? error.message : String(error);
}
//# sourceMappingURL=business-hours.service.js.map
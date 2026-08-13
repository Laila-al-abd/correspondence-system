import type { AcademicCalendarRepository } from '../../../domain/observability/ports/academic-calendar.repository';
import type { SystemSettingRepository } from '../../../domain/observability/ports/system-setting.repository';
export declare const WORKING_HOURS_SETTING_KEY = "working_hours";
export interface WorkingHoursPolicy {
    enabled: boolean;
    days: number[];
    start: string;
    end: string;
    timezone: string;
}
export declare const DEFAULT_POLICY: WorkingHoursPolicy;
export declare class BusinessHoursService {
    private readonly settings;
    private readonly calendar;
    private readonly logger;
    private cached?;
    constructor(settings: SystemSettingRepository, calendar: AcademicCalendarRepository);
    policy(): Promise<WorkingHoursPolicy>;
    invalidate(): void;
    isWorkingMoment(at: Date): Promise<boolean>;
    nextWorkingMoment(at: Date): Promise<Date>;
    addWorkingHours(from: Date, hours: number): Promise<Date>;
    workingHoursBetween(from: Date, to: Date): Promise<number>;
    private windowFor;
    private isHoliday;
    private dateIn;
    private instantAt;
    private startOfDate;
    private merge;
}
export declare function describeDays(days: number[]): string;

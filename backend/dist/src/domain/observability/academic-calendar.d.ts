import { Entity } from "../shared/entity";
import { Identifier } from "../shared/identifier";
import { LocalizedText } from "../shared/localized-text";
import { CalendarPeriodType } from "./enums";
interface CalendarProps {
    name: LocalizedText;
    periodType: CalendarPeriodType;
    startDate: Date;
    endDate: Date;
    description?: LocalizedText;
}
export declare class AcademicCalendar extends Entity {
    private props;
    private constructor();
    static create(id: Identifier, p: CalendarProps): AcademicCalendar;
    static rehydrate(id: Identifier, props: CalendarProps): AcademicCalendar;
    snapshot(): {
        name: {
            ar: string;
            en?: string;
        };
        periodType: CalendarPeriodType;
        startDate: Date;
        endDate: Date;
        description?: {
            ar: string;
            en?: string;
        };
    };
    covers(day: Date): boolean;
    isWorkingPeriod(): boolean;
    get periodType(): CalendarPeriodType;
}
export {};

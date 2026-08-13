"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicCalendar = void 0;
const entity_1 = require("../shared/entity");
const domain_error_1 = require("../shared/domain-error");
const enums_1 = require("./enums");
class AcademicCalendar extends entity_1.Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    static create(id, p) {
        if (p.endDate < p.startDate)
            throw new domain_error_1.InvariantViolationError("Calendar end date is before its start date.");
        return new AcademicCalendar(id, p);
    }
    static rehydrate(id, props) {
        return new AcademicCalendar(id, props);
    }
    snapshot() {
        return {
            name: this.props.name.toJSON(),
            periodType: this.props.periodType,
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            description: this.props.description?.toJSON(),
        };
    }
    covers(day) { return day >= this.props.startDate && day <= this.props.endDate; }
    isWorkingPeriod() { return this.props.periodType !== enums_1.CalendarPeriodType.HOLIDAY; }
    get periodType() { return this.props.periodType; }
}
exports.AcademicCalendar = AcademicCalendar;
//# sourceMappingURL=academic-calendar.js.map
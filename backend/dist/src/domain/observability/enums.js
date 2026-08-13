"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelType = exports.EventType = exports.CalendarPeriodType = void 0;
var CalendarPeriodType;
(function (CalendarPeriodType) {
    CalendarPeriodType["EXAM"] = "EXAM";
    CalendarPeriodType["REGISTRATION"] = "REGISTRATION";
    CalendarPeriodType["HOLIDAY"] = "HOLIDAY";
    CalendarPeriodType["REGULAR"] = "REGULAR";
})(CalendarPeriodType || (exports.CalendarPeriodType = CalendarPeriodType = {}));
var EventType;
(function (EventType) {
    EventType["STATUS_CHANGE"] = "STATUS_CHANGE";
    EventType["STEP_STARTED"] = "STEP_STARTED";
    EventType["STEP_COMPLETED"] = "STEP_COMPLETED";
    EventType["ACTION_TAKEN"] = "ACTION_TAKEN";
    EventType["ASSIGNED"] = "ASSIGNED";
})(EventType || (exports.EventType = EventType = {}));
var ModelType;
(function (ModelType) {
    ModelType["NLP_CLASSIFIER"] = "NLP_CLASSIFIER";
    ModelType["NLP_EXTRACTOR"] = "NLP_EXTRACTOR";
    ModelType["SLA_RISK_BASELINE"] = "SLA_RISK_BASELINE";
})(ModelType || (exports.ModelType = ModelType = {}));
//# sourceMappingURL=enums.js.map
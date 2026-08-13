"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicCalendarMapper = void 0;
const client_1 = require("../../../generated/prisma/client");
const academic_calendar_1 = require("../../domain/observability/academic-calendar");
const localized_text_1 = require("../../domain/shared/localized-text");
const identifier_1 = require("../../domain/shared/identifier");
exports.AcademicCalendarMapper = {
    toDomain(row) {
        const name = row.name;
        const description = row.description;
        return academic_calendar_1.AcademicCalendar.rehydrate(identifier_1.Identifier.of(row.id), {
            name: localized_text_1.LocalizedText.create(name.ar, name.en),
            periodType: row.periodType,
            startDate: row.startDate,
            endDate: row.endDate,
            description: description
                ? localized_text_1.LocalizedText.create(description.ar, description.en)
                : undefined,
        });
    },
    toPersistence(calendar) {
        const s = calendar.snapshot();
        return {
            id: calendar.id.toString(),
            name: s.name,
            periodType: s.periodType,
            startDate: s.startDate,
            endDate: s.endDate,
            description: s.description
                ? s.description
                : client_1.Prisma.JsonNull,
        };
    },
};
//# sourceMappingURL=academic-calendar.mapper.js.map
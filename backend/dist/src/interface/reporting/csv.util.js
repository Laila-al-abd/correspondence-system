"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCsv = toCsv;
const BOM = '\uFEFF';
function toCsv(rows) {
    if (rows.length === 0)
        return '';
    const headers = Object.keys(rows[0]);
    const escape = (value) => {
        if (value === null || value === undefined)
            return '';
        const text = String(value);
        return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    };
    const lines = [headers.join(',')];
    for (const row of rows) {
        const record = row;
        lines.push(headers.map((h) => escape(record[h])).join(','));
    }
    return BOM + lines.join('\r\n') + '\r\n';
}
//# sourceMappingURL=csv.util.js.map
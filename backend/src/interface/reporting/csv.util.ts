/**
 * Serialises a list of flat records to RFC 4180 CSV. Column order follows the
 * keys of the first row; values containing commas, quotes, or newlines are
 * quoted and embedded quotes are doubled. Returns an empty string for no rows.
 */
export function toCsv(rows: object[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const text = String(value)
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    const record = row as Record<string, unknown>
    lines.push(headers.map((h) => escape(record[h])).join(','))
  }
  return lines.join('\r\n') + '\r\n'
}

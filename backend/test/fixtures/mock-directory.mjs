/**
 * A stand-in personnel directory, for testing the sync BY HAND.
 *
 * The automated suite (test/sync.e2e-spec.ts) replaces the directory port in
 * memory, which is the right way to assert on behaviour but shows you nothing.
 * This script exists for the other need: seeing the real thing work, over real
 * HTTP, through the real YAML mapping, so you can watch rows appear in the
 * departments and users tables and put a screenshot in a report.
 *
 * It publishes exactly the shape config/personnel-directory.mapping.yaml
 * expects:
 *   GET /api/org-units            -> { data: { units:     [...] } }
 *   GET /api/org-units/employees  -> { data: { employees: [...] } }
 *
 * Run it:   node test/fixtures/mock-directory.mjs
 * Options:  PORT=8081  DROP_UNIT=ART-MUSIC  (omits that unit, to see pass 3
 *           deactivate it on the next sync)
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.PORT || 8081)
const DROP_UNIT = process.env.DROP_UNIT || ''

const units = [
  { id: 'ART-FAC', parentId: null, name: { ar: 'كلية الفنون', en: 'Faculty of Arts' }, type: 'FAC' },
  { id: 'ART-FINE', parentId: 'ART-FAC', name: { ar: 'قسم الفنون الجميلة', en: 'Fine Arts' }, type: 'DEP' },
  { id: 'ART-MUSIC', parentId: 'ART-FAC', name: { ar: 'قسم الموسيقا', en: 'Music' }, type: 'DEP' },
]

const employees = [
  {
    empNo: 'ART-EMP-1',
    name: { ar: 'سامر الفنان', en: 'Samer Alfannan' },
    contact: { email: 'art.imported1@test.local', mobile: '+963900000001' },
    category: 'EMP',
    unitId: 'ART-FINE',
  },
  {
    empNo: 'ART-STU-1',
    name: { ar: 'ريم الطالبة', en: 'Reem Altaliba' },
    contact: { email: 'art.imported2@test.local', mobile: '+963900000002' },
    category: 'STU',
    unitId: 'ART-MUSIC',
  },
]

const server = createServer((req, res) => {
  const path = (req.url || '').split('?')[0].replace(/\/+$/, '')
  const send = (body) => {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(body))
  }

  if (path === '/api/org-units/employees') {
    console.log('-> people feed read')
    return send({ data: { employees } })
  }
  if (path === '/api/org-units') {
    const published = units.filter((u) => u.id !== DROP_UNIT)
    console.log(`-> unit feed read (${published.length} units)`)
    return send({ data: { units: published } })
  }

  res.writeHead(404, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ error: `No feed at ${path}` }))
})

server.listen(PORT, () => {
  console.log(`mock personnel directory on http://localhost:${PORT}`)
  console.log('  units    : /api/org-units')
  console.log('  employees: /api/org-units/employees')
  if (DROP_UNIT) console.log(`  omitting unit: ${DROP_UNIT}`)
})

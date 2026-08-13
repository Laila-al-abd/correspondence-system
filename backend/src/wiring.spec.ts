/**
 * The wiring test.
 *
 * Nest's CQRS module binds a handler to its command or query only when Nest
 * *instantiates* that class, and it instantiates it only if some module lists it
 * as a provider. @QueryHandler on its own does nothing. That combination has
 * exactly one failure mode: the code compiles, the app boots clean, and the
 * first request to the endpoint dies with
 *
 *   Error: No handler found for the query: "ListOrgUnitTypesQuery"
 *
 * -- at request time, in front of whoever is using the system. The same is true
 * of a controller that was written but never added to a module's `controllers`
 * array: no error anywhere, the route simply does not exist and the frontend
 * gets a 404 it cannot explain.
 *
 * This test reads the source tree and refuses both. It is a static check on
 * purpose: it needs no database, no MinIO and no Nest container, so it runs in
 * under a second and can be the first thing CI does.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = __dirname

function listTsFiles(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...listTsFiles(full))
    else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts'))
      found.push(full)
  }
  return found
}

const read = (file: string): string => readFileSync(file, 'utf8')

const files = listTsFiles(SRC)
const moduleSource = files
  .filter((file) => file.endsWith('.module.ts'))
  .map(read)
  .join('\n')

/** Matches the decorator, any decorators between it and the class, and the name. */
const HANDLER_CLASS =
  /@(?:CommandHandler|QueryHandler|EventsHandler)\([^)]*\)\s*(?:@\w+\([^)]*\)\s*)*export\s+class\s+(\w+)/g
const HANDLER_DECORATOR = /@(?:CommandHandler|QueryHandler|EventsHandler)\(/
const EXPORTED_CLASS = /export\s+class\s+(\w+)/

interface Declared {
  name: string
  file: string
}

const handlers: Declared[] = []
const filesDeclaringHandlers: string[] = []
for (const file of files) {
  const text = read(file)
  if (!HANDLER_DECORATOR.test(text)) continue
  filesDeclaringHandlers.push(file)
  for (const match of text.matchAll(HANDLER_CLASS))
    handlers.push({ name: match[1], file })
}

const controllers: Declared[] = []
for (const file of files.filter((f) => f.endsWith('.controller.ts'))) {
  const match = EXPORTED_CLASS.exec(read(file))
  if (match) controllers.push({ name: match[1], file })
}

/** A relative path, so a failure message points at the file to open. */
const rel = (file: string): string => file.slice(SRC.length + 1)

describe('Nest wiring', () => {
  it('finds handler classes in every file that declares one', () => {
    // Guards the regex itself: if the codebase adopts a shape this pattern does
    // not match, the test below would silently start checking nothing.
    const named = new Set(handlers.map((handler) => handler.file))
    const unmatched = filesDeclaringHandlers
      .filter((file) => !named.has(file))
      .map(rel)
    expect(unmatched).toEqual([])
    expect(handlers.length).toBeGreaterThan(50)
  })

  it('registers every CQRS handler in a module', () => {
    const unregistered = handlers
      .filter((handler) => !moduleSource.includes(handler.name))
      .map((handler) => `${handler.name} (${rel(handler.file)})`)

    // If this fails, add the class to the `handlers` array of the module that
    // owns its endpoint. Nothing else will tell you: the app boots fine and the
    // route fails on the first real request.
    expect(unregistered).toEqual([])
  })

  it('registers every controller in a module', () => {
    const unregistered = controllers
      .filter((controller) => !moduleSource.includes(controller.name))
      .map((controller) => `${controller.name} (${rel(controller.file)})`)

    expect(unregistered).toEqual([])
  })
})

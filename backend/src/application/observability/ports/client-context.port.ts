/**
 * The ambient facts about whoever is making the current call: who they are and
 * where they connected from.
 *
 * A port rather than a direct read of the AsyncLocalStorage store, because the
 * application layer imports no infrastructure anywhere in this codebase and one
 * convenient exception is how that stops being true. It also keeps the services
 * that record audit rows testable without a live HTTP request.
 *
 * Both values are optional and mean "nobody was asking": a scheduled sweep, a
 * seed run and the startup path all execute with no caller.
 */
export interface ClientContextPort {
  userId(): string | undefined
  ipAddress(): string | undefined
}

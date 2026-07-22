# Application layer

Use cases, organised as **vertical slices** with `@nestjs/cqrs`.

```
application/
  tokens.ts                     # DI tokens that bind domain ports to adapters
  errors.ts                     # application-level errors (mapped to HTTP by a filter)
  <context>/
    commands/<use-case>/
      <use-case>.command.ts     # input (plain class)
      <use-case>.handler.ts     # @CommandHandler
    queries/<use-case>/
      <use-case>.query.ts
      <use-case>.handler.ts     # @QueryHandler
      <name>.view.ts            # read model returned to the caller
```

Rules:

- Handlers depend only on **domain ports** (interfaces), injected via the tokens
  in `tokens.ts`. No Prisma, no HTTP, no NestJS `HttpException` in here.
- Input validation belongs to the **interface** layer (`class-validator` DTOs).
- Throw `ApplicationError` subclasses (see `errors.ts`) or domain errors; the
  `DomainExceptionFilter` in the interface layer maps them to HTTP responses.

See `docs/adr/0001-domain-modeling-and-application-structure.md` for the rationale
and for which contexts are "rich" vs "simple".

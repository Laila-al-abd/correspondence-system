# ADR 0001 — Domain modeling strategy & application-layer structure

- **Status:** Accepted
- **Date:** 2026-07-17
- **Context:** Intelligent Administrative Correspondence System (graduation project)

## Context

We follow Clean Architecture (four layers, dependencies point inward:
`domain <- application <- infrastructure <- interface`). Two decisions needed
an explicit, defensible answer:

1. Should **every** context use a rich domain model (entities with behaviour and
   invariants), or is that over-engineering for the simpler parts of the system?
2. How should the **application layer** be organised so use cases stay
   discoverable as the system grows?

A reference project we reviewed (DLMS, a .NET metadata catalog) used an **anemic**
domain model (entities are plain data bags; logic lives in handlers) together with
a **vertical-slice CQRS** application layer (one folder per use case). That is the
right trade-off for a CRUD-heavy catalog, but our workflow domain has real
invariants (DAG readiness, SLA math, HITL thresholds, delegation windows, org-tree
rules), so a single blanket style is not optimal.

## Decision

### 1. Rich vs. simple domain models — decided *per context*

| Context | Style | Why |
|---|---|---|
| **Identity & Access** | Rich | Real invariants: applicant vs. institutional number, LOCAL-auth password rule, delegation date windows, role/permission rules. |
| **Organization** | Rich | Department tree integrity + idempotent personnel sync. |
| **Workflow** | Rich | DAG validity, assignee-type consistency. |
| **Request** (runtime) | Rich | Snapshot-on-submit, step state machine, SLA, confidence -> HITL. |
| **Catalog** (languages, sensitivity levels, categories, action types, settings) | Simple | Mostly CRUD over reference data; almost no invariants. A rich aggregate here would be ceremony. |
| **Observability / AI logs** | Simple | Append-only records; typed access is enough. |

**Rule of thumb:** a context earns a rich model only when it has behaviour and
invariants to protect. Deliberate, justified variation is stronger engineering
(and a stronger defense) than applying DDD everywhere by reflex.

### 2. Application layer = vertical-slice CQRS (borrowed from DLMS)

Using `@nestjs/cqrs`. One folder per use case:

```
application/<context>/commands/<use-case>/
    <use-case>.command.ts     # the input (plain class)
    <use-case>.handler.ts     # @CommandHandler — orchestrates domain + ports
application/<context>/queries/<use-case>/
    <use-case>.query.ts
    <use-case>.handler.ts     # @QueryHandler
    <name>.view.ts            # read model (DTO) returned to callers
```

- Handlers depend only on **domain ports** (interfaces), never on Prisma/HTTP.
- Request validation lives in the **interface** layer as `class-validator` DTOs
  (our equivalent of DLMS's FluentValidation validators).
- Ports are bound to adapters in each feature module (the composition root).

### 3. Ports & adapters

- Domain declares ports (`UserRepository`, `AuthProvider`, `PersonnelDirectory`,
  `LanguageRepository`, `PasswordHasher`, `IdGenerator`, ...).
- Infrastructure implements them (Prisma repositories, bcrypt hasher, HTTP
  personnel adapter, in-memory repositories for tests / not-yet-migrated tables).
- DI tokens live in `application/tokens.ts` so the pure domain stays framework-free.

## Consequences

- The workflow/identity core is unit-testable without a database or NestJS.
- New auth methods (LDAP, OTP) and the personnel sync are added as new adapters
  behind existing ports — no changes to domain or use cases.
- Simple contexts stay lightweight; we don't pay DDD ceremony where there's no
  invariant to protect.
- Until the full Prisma schema is built out, rich contexts can run on in-memory
  adapters; swapping in Prisma adapters later touches only the infrastructure layer.

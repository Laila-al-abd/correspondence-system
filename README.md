# ICS — Intelligent Administrative Correspondence System

نظام المراسلات الإدارية الذكي — HIAST

A university correspondence system that accepts administrative requests, classifies
them against a template catalogue with a fine-tuned Arabic language model, and drives
each one through a configurable approval workflow with routing, delegation, SLA
tracking, fees and document handling.

The repository holds three deployable applications and one offline dataset toolkit:

| Part | Stack | Role |
| --- | --- | --- |
| `backend/` | NestJS 11 + Prisma 7 + PostgreSQL 16 | The whole domain. REST API, CQRS handlers, workflow engine, authz. |
| `frontend/` | Next.js 16 + React 19 + TanStack Query | Staff and requester interface. |
| `ai-service/` | Python 3.13 + PyTorch + Transformers | Classifies draft requests; polls the API as an ordinary authenticated client. |
| `ai-service/data-gen/` | Python | Offline synthetic-dataset generator. Not deployed. |

---

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20 LTS or newer | Next.js 16 and NestJS 11 both require ≥ 20.9. |
| npm | 10+ | Ships with Node 20. |
| Python | 3.13 | Only for `ai-service/`. |
| Docker + Compose | any recent | Supplies PostgreSQL and MinIO. |
| PostgreSQL | 16 | Provided by `docker-compose.yml`. |
| MinIO | latest | S3-compatible document storage, also from Compose. |

A CUDA GPU is optional. The classifier runs on CPU; inference is slower but correct.

---

## 2. Quick start

Run these in order from the repository root. Each block is a separate terminal.

### 2.1 Infrastructure

```bash
docker compose up -d
```

Starts PostgreSQL on `5432` and MinIO on `9000` (S3 API) and `9001` (web console).
Credentials are in `docker-compose.yml`; they are development values and must be
changed before any real deployment.

### 2.2 Backend

```bash
cd backend
npm install
cp .env.example .env          # then fill in the blanks — see §5
npx prisma generate
npx prisma migrate deploy     # use `migrate dev` if you intend to add migrations
npm run seed                  # permissions, roles, unit types, action types, admin user
npm run start:dev
```

API on **http://localhost:3000**. Interactive Swagger docs on
**http://localhost:3000/api-docs**.

`JWT_SECRET` and the two MinIO keys have no defaults on purpose — the app refuses to
start without them rather than quietly falling back to a well-known credential.

### 2.3 Frontend

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

UI on **http://localhost:3001**.

> **The `-p 3001` matters.** `next dev` defaults to port 3000, which the backend is
> already using. The backend's default CORS allow-list is
> `http://localhost:3001`, so running the frontend anywhere else means every API
> call is refused by the browser. If you must use another port, add it to
> `CORS_ORIGINS` in `backend/.env`.

`frontend/.env.local` holds `NEXT_PUBLIC_API_BASE_URL`, pointing at the backend.

### 2.4 AI service

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # BACKEND_URL and the service account
```

Download the fine-tuned classifier (§6) into `ai-service/models/classifier/`, then run
either or both:

```bash
python -m ics_ai.worker                       # background classification loop
uvicorn ics_ai.app:app --port 8000            # optional HTTP wrapper
```

The worker signs in with `AI_SERVICE_EMAIL` / `AI_SERVICE_PASSWORD`. That account
needs the `request.classify` permission and nothing else.

---

## 3. Project structure

```
ICS/
├── docker-compose.yml          PostgreSQL 16 + MinIO for local development
├── systemBlock.md              System block description
├── codebase.md                 Generated source digest
│
├── backend/                    NestJS API — the entire domain model
│   ├── prisma/
│   │   ├── schema.prisma       35 models, the single source of truth for the DB
│   │   ├── migrations/         21 ordered migrations
│   │   └── seed.ts             Permissions, roles, unit types, action types, admin
│   └── src/
│       ├── main.ts             Bootstrap: CORS, 15 MB body cap, Swagger, filters
│       ├── app.module.ts       Root module composition
│       │
│       ├── domain/             Layer 1 — pure business rules, zero framework imports
│       │   ├── identity/       User, Role, Permission, Delegation, value objects
│       │   ├── organization/   Department, OrgUnitType, ExternalRef
│       │   ├── catalog/        Template, TemplateField, EligibilityRule, Language
│       │   ├── workflow/       WorkflowPath, WorkflowStep
│       │   ├── request/        Request, RequestStepInstance, Payment, Document, Money
│       │   ├── observability/  Notification, EventLog, MlPrediction, SystemSetting
│       │   └── shared/         Entity, ValueObject, Guard, DomainError, ports
│       │
│       ├── application/        Layer 2 — CQRS use cases, one folder per command/query
│       │   ├── identity/       Auth, roles, delegations, directory user sync
│       │   ├── organization/   Department creation and directory sync
│       │   ├── catalog/        Template authoring
│       │   ├── access/         ABAC eligibility evaluation
│       │   ├── workflow/       Workflow path definition and activation
│       │   ├── request/        Submit, classify, act on step, pay, assign
│       │   │   └── services/   AssigneeResolver — routing, escalation, delegation
│       │   ├── observability/  Notifications, event recording
│       │   └── reporting/      Aggregate reporting queries
│       │
│       ├── infrastructure/     Layer 3 — adapters implementing the domain ports
│       │   ├── prisma/         PrismaService, transaction runner
│       │   ├── identity/       Prisma repositories, bcrypt hasher, JWT service
│       │   ├── organization/   HTTP personnel-directory client + YAML mapping
│       │   ├── request/        Request repositories, assignee directory queries
│       │   ├── storage/        MinIO object storage adapter
│       │   └── observability/  SLA monitor scheduler, notification stream (SSE)
│       │
│       └── interface/          Layer 4 — HTTP surface
│           ├── */              One controller folder per context, with DTOs
│           └── shared/         Guards, decorators, exception filter, middleware
│
├── frontend/                   Next.js App Router
│   └── src/
│       ├── app/                Routes; folder path = URL path
│       │   ├── login/  register/
│       │   └── dashboard/      requests, templates, users, roles, delegations,
│       │                       organization, reports, access, notifications
│       ├── components/
│       │   ├── ui/             Primitives (button, table, dialog, select…)
│       │   ├── forms/          One component per mutation
│       │   └── permission-gate.tsx
│       ├── lib/
│       │   ├── api/            Axios clients, one file per backend context
│       │   ├── hooks/          TanStack Query hooks wrapping those clients
│       │   ├── auth/           Permission provider, token handling
│       │   ├── notifications/  SSE subscription and routing
│       │   └── validations/    Zod schemas
│       └── types/              TypeScript mirrors of backend DTOs and views
│
└── ai-service/
    ├── ics_ai/
    │   ├── config.py           Thresholds, poll interval, kill switches
    │   ├── classifier.py       MARBERTv2 encoder, catalogue scoring, abstention
    │   ├── backend.py          Typed HTTP client for the ICS API
    │   ├── worker.py           Poll → classify → submit → escalate loop
    │   └── app.py              Optional FastAPI wrapper
    ├── models/classifier/      Fine-tuned weights — NOT in git, see §6
    ├── requirements.txt        Pinned dependencies
    └── data-gen/               Offline synthetic dataset generator
        ├── ics_data/           Generation, verification, template definitions
        └── out/dataset/        Generated train/dev/test splits
```

### Why the backend has four layers

Dependencies point inward only: `interface → application → domain`, with
`infrastructure` implementing interfaces the domain declares. The domain imports no
framework and no Prisma, so business rules are testable without a database and
swapping an adapter (MinIO for S3, LDAP for local auth) touches one folder.

Each use case is a folder holding a command and its handler. `AssigneeResolver` is the
exception — it is a shared domain service because step routing, upward escalation and
delegation are needed by several handlers and must behave identically in all of them.

---

## 4. Technologies

**Backend** — NestJS 11, `@nestjs/cqrs`, Prisma 7 (`@prisma/adapter-pg`),
PostgreSQL 16, `class-validator` / `class-transformer`, `bcryptjs`, `minio`,
`@nestjs/swagger`, `@nestjs/throttler`, `yaml`, `uuid`.

**Frontend** — Next.js 16 (App Router), React 19, TanStack Query 5,
TanStack Table, Axios, React Hook Form + Zod, Tailwind CSS 4, shadcn/base-ui,
lucide-react, recharts, date-fns, zustand, jose, js-cookie.

**AI service** — PyTorch 2.13, Transformers 5.13, `huggingface_hub`, scikit-learn,
NumPy, pandas, FastAPI + uvicorn, httpx, pydantic, PyYAML, python-dotenv.

**Infrastructure** — Docker Compose, MinIO, PostgreSQL 16.

---

## 5. Configuration

Every variable the system reads. Copy each `.env.example` and fill it in; never commit
a real `.env`.

### `backend/.env`

| Variable | Required | Default | Meaning |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | — | PostgreSQL connection string. |
| `JWT_SECRET` | yes | — | Access-token signing key. App refuses to start without it. |
| `JWT_ISSUER` | no | `ics` | Token `iss` claim. |
| `JWT_EXPIRES_IN` | no | `3600` | Token lifetime, seconds. |
| `MINIO_ACCESS_KEY` | yes | — | No default, deliberately. |
| `MINIO_SECRET_KEY` | yes | — | No default, deliberately. |
| `MINIO_ENDPOINT` | no | `localhost` | |
| `MINIO_PORT` | no | `9000` | |
| `MINIO_USE_SSL` | no | `false` | |
| `MINIO_BUCKET` | no | `ics-documents` | |
| `PORT` | no | `3000` | API port. |
| `CORS_ORIGINS` | no | `http://localhost:3001` | Comma-separated browser origins. |
| `STAFF_IP_ALLOWLIST` | no | empty | IP prefixes exempt from the working-hours rule. |
| `NOTIFICATION_RETENTION_DAYS` | no | `30` | |
| `NOTIFICATION_RETENTION_SWEEP_HOURS` | no | `24` | |
| `SLA_SWEEP_MINUTES` | no | `15` | SLA risk recomputation interval. |
| `WORKFLOW_REASSIGN_ON_RELEASE` | no | enabled | Re-resolve step ownership when a step is released. |
| `PERSONNEL_DIRECTORY_URL` | for sync | — | Upstream HR/registry base URL. |
| `PERSONNEL_DIRECTORY_API_KEY` | for sync | — | Sent as `Authorization: Bearer`. |
| `PERSONNEL_DIRECTORY_TIMEOUT_MS` | no | `10000` | |
| `PERSONNEL_DIRECTORY_MAPPING_PATH` | no | `config/personnel-directory.mapping.yaml` | Field mapping; re-read on change, no restart. |

### `frontend/.env.local`

| Variable | Default | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | Backend origin. |

### `ai-service/.env`

| Variable | Default | Meaning |
| --- | --- | --- |
| `BACKEND_URL` | `http://localhost:3000` | ICS API base URL. |
| `AI_SERVICE_EMAIL` | — | Service account with `request.classify`. |
| `AI_SERVICE_PASSWORD` | — | Its password. |

Tuning constants (confidence threshold `0.80`, cosine threshold `0.48`, `top_k = 3`,
`poll_seconds = 30`, `template_sync_seconds = 600`, `flag_for_review`, `dry_run`) live
in `ics_ai/config.py`.

---

## 6. Large files — models and datasets

Neither the base model nor the fine-tuned weights are stored in this repository.

### Base model (pre-trained, no fine-tuning)

**MARBERTv2** — an Arabic BERT pre-trained by UBC NLP, the starting point for the
classifier.

- Hugging Face: <https://huggingface.co/UBC-NLP/MARBERTv2>
- Paper: Abdul-Mageed et al., *ARBERT & MARBERT: Deep Bidirectional Transformers for
  Arabic* (ACL 2021) — <https://aclanthology.org/2021.acl-long.551/>
- Downloaded automatically by `transformers` on first run, into the Hugging Face
  cache (`~/.cache/huggingface`). No manual step needed.

### Fine-tuned classifier

Produced by the notebook `01_classifier_v2_MARBERTv2.ipynb`, exported as
`ics-classifier-v2.zip`. Unzip it so the weights sit directly in:

```
ai-service/models/classifier/
```

Training configuration: `max_len = 256`, 9-way catalogue cross-entropy, 2 epochs,
batch 32, learning rate 2e-5, temperature 0.05, seed 42; evaluated over seeds 1, 7 and
42. Twelve templates — 9 seen during training, 3 held out to measure zero-shot
behaviour. Reported with macro F1, plus abstention on a cosine and margin rule.

### Training data

Synthetic, generated offline by `ai-service/data-gen/`. Splits are committed under
`ai-service/data-gen/out/dataset/` (train, dev, zero-shot test, style-shift test).
Regenerate with:

```bash
cd ai-service/data-gen
python gen.py
```

---

## 7. Testing

```bash
cd backend
npm test              # unit tests
npm run test:e2e      # end-to-end
```

```bash
cd frontend && npm run lint
cd backend  && npm run lint
```

---

## 8. issues

- **`ai-service/requirements.txt` is UTF-16 encoded.** `pip install -r` copes, but many
  editors and CI tools do not. Convert it to UTF-8 when convenient.

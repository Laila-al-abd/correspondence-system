# ICS AI service - classifier + queue worker

Built against the 2 Aug 2026 handoff. Runs on the i3 / 8 GB laptop, CPU only.

## The shape of the integration

The backend never calls us. We go and find the work:

```
  GET  /auth/login                     once, reuse the token
  GET  /requests/queue?status=DRAFT    cursor-paged, filter PENDING
  GET  /requests/:id                   rawText lives here, not on the list view
  model                                top-3 template codes
  POST /requests/:id/classify/model    -> CLASSIFIED or HITL
```

`ics_ai/worker.py` is that loop. The FastAPI app is for the demo and manual
testing; it is not on the critical path.

## Layout

```
ai-service/
  main.py                     uvicorn main:app --port 8000
  ics_ai/
    config.py                 every tunable, one file
    classifier.py             the model
    priority.py               suggestedPriority (a rule, not a model)
    backend.py                HTTP client: auth, paging, throttle, backoff
    worker.py                 the pull loop
    app.py                    FastAPI routes
  tools/
    fetch_template_ids.py     build code -> UUID map      <- DO THIS FIRST
    measure_threshold.py      choose and justify the threshold
    export_onnx.py            int8 export for the 8 GB laptop
  models/
    classifier/               unzip ics-classifier-v2.zip here
    template_docs.json        copy from data-gen/out/dataset/
    template_map.json         code -> backend UUID
  .env                        credentials, never committed
  venv/
```

## Setup

You already have `venv` and the deps from the setup guide. Add two:

```powershell
cd C:\HIAST\correspondenceSystem\ai-service
.\venv\Scripts\Activate.ps1
pip install httpx python-dotenv
```

Copy `.env.example` to `.env` and fill in the service account:

```
BACKEND_URL=http://localhost:3000
AI_SERVICE_EMAIL=ai-service@correspondence.local
AI_SERVICE_PASSWORD=...
```

## The step that blocks everything else

The model predicts a CODE (`ENROLL_CERT`). The backend wants the UUID of a
`templates` row. Nothing bridges those automatically.

```powershell
python tools\fetch_template_ids.py
```

It tries the backend, then writes `models/template_map.json`. Any code left
`null` must be filled by hand from Prisma Studio (localhost:5555, `templates`).
**A code with no UUID can never be submitted** - the worker counts it and skips
it rather than guessing.

If your 12 dataset templates do not match the seeded `templates` rows one for
one, that mismatch is a real project issue, not a mapping bug. Find it now.

## Prove the round trip before trusting the model

This is step 3 of the handoff's build order, and it is the one that matters.

```powershell
python -m ics_ai.worker --once --dry-run --limit 5
```

Reads and predicts, never POSTs. You see what it *would* send. Then for real:

```powershell
python -m ics_ai.worker --once --limit 1
```

Watch one request flip to `CLASSIFIED` or `HITL` in Prisma Studio, and check an
`ml_predictions` row appeared with your `modelVersion` on it.

Then the full pass, or continuous:

```powershell
python -m ics_ai.worker --once
python -m ics_ai.worker --loop
```

## The API (demo surface)

```powershell
uvicorn main:app --reload --port 8000
```

```
GET  /health             device, templates, unmapped codes, threshold
POST /classify           {"text": "..."}  -> ranked top 3
POST /classify-batch
POST /reload-templates   re-read + re-embed template_docs.json
POST /run-once           trigger one worker pass  {"limit": 5, "dry_run": true}
```

Interactive docs at http://localhost:8000/docs.

## confidence, threshold, and HITL

The backend rule is `trusted = confidence >= threshold`, threshold default 0.8.
We send both on every call, so the auto-accept boundary is tunable with no
backend deploy.

`confidence` is **not** the raw cosine. Cosines are not probabilities and
comparing one to 0.8 is meaningless. We send a softmax over all template scores
at the training temperature, which is the model's own trained belief and is
properly bounded 0..1. On an ambiguous or out-of-scope request the scores bunch
together and the softmax falls - which is exactly when you want HITL.

Below the threshold the guess is still sent. The handoff is explicit that the
template is applied either way and becomes the reviewer's starting suggestion,
so withholding a low-confidence answer only makes the reviewer's job harder.

To choose the number:

```powershell
python tools\measure_threshold.py ..\data-gen\out\dataset
```

Coverage / precision / HITL share at each candidate threshold.

**Say this part out loud in the defense:** on script-written data the model is
right almost every time, so nearly any threshold looks excellent. That is a
property of the test set, not of the system. The real threshold comes from
`ml_predictions` once reviewers have corrected some live rows - which is
precisely what that table is for.

## When the backend says no

`400 FilledDataInvalidError` and `403 NotEligibleError` mean the template choice
was wrong, not that the call was malformed. The worker falls back to candidate
2, then candidate 3. That is why the classifier returns a ranked list.

`404` drop, `409` retried once, `429` backed off, `400 Only draft` skipped.
`403` with no `NotEligible` in the body is almost certainly `STAFF_IP_ALLOWLIST`
- open item 4 in the handoff, not a bug in this client.

## Running on 8 GB

Docker Desktop plus WSL2, Postgres, MinIO, NestJS, Next.js and PyTorch do not
comfortably share 8 GB. `torch_threads` is set to 2 because the i3-1115G4 has
two physical cores; raising it makes things slower, not faster.

For the demo:

- Do not run the frontend dev server on the same machine if you can avoid it
- Drop `--reload` from uvicorn (it runs a second process)
- Run the worker with `--limit`, not `--loop`
- Export to int8: `pip install optimum[onnxruntime]` then
  `python tools\export_onnx.py` - roughly 4x smaller, 2-3x faster on CPU

After quantising, re-run `measure_threshold.py`. The scores shift slightly and
the threshold must be re-checked rather than assumed.

## Not in scope here

Field extraction (`02_extractor.ipynb`) is a separate model. When it is trained
it slots in beside the classifier and writes through a `filledData` route that
does not exist yet - open item 6. Nothing in this package depends on it.

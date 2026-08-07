# ICS NLP data generation toolkit

Reverse generation of Arabic administrative requests for the Intelligent
Correspondence System AI service. Produces, from zero manual annotation:

- **classification data** for the bi-encoder (request text -> template)
- **extraction data** in SQuAD v2 format (question per field, spans, no-answer rows)
- **template documents** for the retrieval index
- a **QA report** telling you whether your generations are usable

## Why reverse generation

Writing texts and then annotating spans is the expensive part of any extraction
project. Here the order is inverted:

1. sample the field values first (`generate_specs.py`)
2. ask an LLM to write a natural request containing them
3. locate them programmatically (`arabic.find_span`)

The gold spans are a consequence of how the example was built, so annotation is
free and no two annotators can disagree.

## Install

No dependencies beyond the Python standard library. Python 3.9+.

## Pipeline

### 1. Generate specs and prompts

```bash
python3 -m ics_data.generate_specs --per-template 200 --generator A --out out --seed 1
python3 -m ics_data.generate_specs --per-template 200 --generator B --out out --seed 2
python3 -m ics_data.generate_specs --per-template 50  --generator C --out out --seed 3

# held-out templates 10-12, zero-shot TEST ONLY
python3 -m ics_data.generate_specs --per-template 40 --generator Z --out out --seed 4 --include-unseen
```

Use a **different LLM family for A, B and C**. A single model has a stylistic
fingerprint; if you train and test on one model you measure recognition of that
model, not understanding of Arabic requests. Generator C never enters training,
so `test_style_shift` measures robustness to an unseen writing style.

### 2. Run the prompts

`out/prompts/*.txt` are ready to paste, 10 requests each. Save each reply as
`out/raw/<batch_id>.json`. Code fences and surrounding prose are tolerated.

The prompt makes the generator return `used_surface_forms`: the literal string
it wrote for each field. This is what makes inflected values usable rather than
lost -- see below.

### 3. Verify and build

```bash
python3 -m ics_data.verify_and_build --out out
```

Outputs under `out/dataset/`:

| file | purpose |
|---|---|
| `records.jsonl` | full verified records, every field with span + canonical value |
| `classification_<split>.jsonl` | text -> template_code |
| `extraction_<split>.json` | SQuAD v2, one question per field |
| `pairs_train.jsonl` | (query, positive) pairs for `MultipleNegativesRankingLoss` |
| `template_docs.json` | the text embedded to represent each template |
| `rejects.jsonl` | everything thrown out, with the reason |
| `report.md` | QA report |

## The three outcomes

Every injected value lands in one of these, and the distinction is the whole
point of the verifier:

| | case | handling |
|---|---|---|
| **A** | value appears literally | keep, offsets from `str.find` |
| **B** | value appears inflected (`للسفارة` for `السفارة`) | **keep** -- the most realistic data you have |
| **C** | value absent or changed | reject, never relabel |

A naive `text.find()` collapses B and C into one result. Losing B throws away
your best examples. Turning C into `answer: null` is worse: it teaches the
extractor that a clearly stated field is missing, which destroys the no-answer
behaviour that stops the model inventing values.

`arabic.find_span` therefore tries three strategies in order: exact, normalised
(diacritics, alef/ya/ta-marbuta, Arabic-Indic digits), then inflected (allows
attached proclitics `و ف ب ك ل` and an optional `ال` on each token), mapping the
match back to offsets in the **original** string so the span always slices back
to exactly what the user wrote.

## Span vs value

Each verified field stores both:

```json
"destination_entity": {
  "value":   "السفارة الألمانية",     // canonical -> filledData, eligibility rules
  "surface": "للسفارة الألمانية",   // what the user wrote -> QA training target, UI highlight
  "start": 38, "end": 55, "is_impossible": false
}
```

The model predicts the **span**. `arabic.normalise_value` converts it to the
**value** (`نسختين` -> `2`, `٢` -> `2`, `بالإنكليزي` -> `EN`, `15 أيلول 2026`
-> `2026-09-15`). The model can never emit a value that is not in the text: its
output is two integer offsets, not generated tokens.

## Noise policy

Only error types the preprocessor cannot erase are worth generating. Alef,
ya and ta-marbuta variants are normalised away in `arabic.py`, so the prompts
ask instead for word-level typos, spacing errors, dialect vocabulary, missing
punctuation and code-switching. Roughly 40% of rows carry noise; the rest stay
clean so the model does not learn that noise is the norm. `report.md` breaks
results down by noise level so you can publish clean vs noisy accuracy
separately.

## Splits

| split | source | what it measures |
|---|---|---|
| `train` | generators A + B, templates 1-9 | -- |
| `dev` | 13% held out from the same pool | threshold and temperature calibration |
| `test_style_shift` | generator C only, templates 1-9 | robustness to an unseen writing style |
| `test_zero_shot` | **templates 10-12, never trained on** | the open-set claim |

`test_zero_shot` is the experiment that justifies the architecture: a university
can add a template the model has never seen, and classification still works
because the bi-encoder matches the request against the template's *description*
rather than a fixed label set. `verify_and_build` raises `SystemExit` if a
held-out template ever appears in train.

## Tuning

- Per-field omission is controlled by `present_rate` in `templates.py`. Aim for
  an overall no-answer share of 15-25%; the report prints it. Raise
  `present_rate` if it comes out too high.
- Add a template by appending to `TEMPLATES`. Nothing else changes -- the
  template document, the prompts, the questions and the SQuAD file all derive
  from that one entry.
- `question_ar` on each field is the value that belongs in the
  `template_fields.extraction_question` column in Prisma. That column is what
  keeps extraction configurable: a new field means a new question, not a new
  model.

## Files

```
ics_data/templates.py         12 templates, fields, questions, value pools
ics_data/arabic.py            normalisation, tolerant span search, value normalisers
ics_data/generate_specs.py    step 1: sample specs, emit prompts
ics_data/verify_and_build.py  step 2: verify, split, build datasets, QA report
selftest.py                   proves the verifier handles A/B/C correctly
mock_llm.py                   offline fake generator for smoke-testing only
```

## Smoke test

```bash
python3 selftest.py                      # unit checks, no LLM needed
python3 -m ics_data.generate_specs --per-template 12 --generator A --out out --seed 1
python3 mock_llm.py out                  # fabricate replies
python3 -m ics_data.verify_and_build --out out
```

Delete `out/raw/mock_*.json` before adding real generations.

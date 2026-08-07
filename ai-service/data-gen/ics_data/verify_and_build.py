# -*- coding: utf-8 -*-
"""
Step 2 of the pipeline: verify the LLM output and build the training sets.

Every generated row is sorted into one of three outcomes:

    A  exact       the value appears literally           -> keep
    B  inflected   the value appears with attached
                   prefixes or normalisation variants    -> KEEP, best data we have
    C  rejected    the value is absent or changed        -> drop, never relabel

Collapsing B into C throws away the most realistic examples. Collapsing C into
"field is absent" is worse: it teaches the extractor that a field the user
clearly stated is missing, which poisons the no-answer behaviour that stops the
model inventing values. So the two are separated explicitly and both counted.

Usage:
    python -m ics_data.verify_and_build --out out
"""

from __future__ import annotations

import argparse
import collections
import glob
import json
import os
import random
import re

from .arabic import (arabic_ratio, close_enough, find_span, norm_bool,
                      normalise_value, normalize)
from .templates import BY_CODE, TEMPLATES, template_document

MIN_CHARS = 15
MAX_CHARS = 900
MIN_ARABIC_RATIO = 0.45


def load_specs(out_dir: str) -> dict:
    specs = {}
    for path in glob.glob(f"{out_dir}/specs_*.jsonl"):
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    s = json.loads(line)
                    specs[s["spec_id"]] = s
    return specs


def _extract_json(raw: str):
    """LLMs wrap JSON in prose or code fences more often than not."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    start = raw.find("{")
    end = raw.rfind("}")
    if start >= 0 and end > start:
        try:
            return json.loads(raw[start:end + 1])
        except json.JSONDecodeError:
            return None
    return None


def load_generations(out_dir: str):
    items, bad_files = [], []
    for path in sorted(glob.glob(f"{out_dir}/raw/*.json")) + sorted(glob.glob(f"{out_dir}/raw/*.txt")):
        with open(path, encoding="utf-8") as fh:
            data = _extract_json(fh.read())
        if not data:
            bad_files.append(path)
            continue
        rows = data.get("items") if isinstance(data, dict) else data
        if not isinstance(rows, list):
            bad_files.append(path)
            continue
        for r in rows:
            if isinstance(r, dict) and r.get("spec_id") and r.get("text"):
                r["_source_file"] = os.path.basename(path)
                items.append(r)
    return items, bad_files


def verify_item(item: dict, spec: dict):
    """Return (record | None, reject_reason | None, per_field_outcomes)."""
    t = BY_CODE[spec["template_code"]]
    text = item["text"].strip()
    outcomes = {}

    if not (MIN_CHARS <= len(text) <= MAX_CHARS):
        return None, "length_out_of_range", outcomes
    if arabic_ratio(text) < MIN_ARABIC_RATIO:
        return None, "not_arabic_enough", outcomes

    surfaces = item.get("used_surface_forms") or {}
    fields_out = {}

    for f in t["fields"]:
        key = f["key"]

        # ---- field deliberately omitted: must genuinely be absent ----
        if key in spec["omitted_fields"]:
            if key in surfaces and str(surfaces[key]).strip():
                return None, f"omitted_field_leaked:{key}", outcomes
            fields_out[key] = {"value": None, "surface": None,
                               "start": None, "end": None, "is_impossible": True}
            outcomes[key] = "absent"
            continue

        expected = spec["values"][key]

        # Prefer the surface form the generator reports; fall back to the
        # injected value, which only works when nothing was inflected.
        candidates = []
        if key in surfaces and str(surfaces[key]).strip():
            candidates.append(str(surfaces[key]).strip())
        candidates.append(str(expected))
        if f["data_type"] == "ENUM":
            candidates += [o["label_ar"] for o in f["options"] if o["code"] == expected]

        hit = None
        for cand in candidates:
            hit = find_span(text, cand)
            if hit:
                break
        if not hit:
            return None, f"value_not_found:{key}", outcomes

        start, end, surface, how = hit
        outcomes[key] = how

        # semantic check: does the span normalise back to the value we asked for?
        got = normalise_value(surface, f)
        ok = True
        if f["data_type"] == "BOOL":
            # normalise BOTH sides. `got` is a real bool; `expected` is the
            # string «نعم» / «لا» from the spec, and True == "نعم" is False,
            # which silently rejected every single bool row.
            ok = got is not None and got == norm_bool(expected)
        elif f["data_type"] in ("NUM", "ENUM"):
            ok = got == expected
        elif f["data_type"] == "DATE":
            ok = got is None or got == expected  # relative phrasing resolves at runtime
        else:
            # TEXT: the reported surface really is in the text, but is it the
            # value we asked for? A generator that swaps الألمانية for الفرنسية
            # produces a perfectly locatable span carrying the WRONG label.
            # Require containment in one direction, tolerant of inflection.
            ok = (find_span(surface, str(expected)) is not None
                  or find_span(str(expected), surface) is not None
                  # deliberate misspelling: keep the row, keep the canonical
                  # value as gold, keep the misspelt span as the answer.
                  or close_enough(surface, expected))
        if not ok:
            return None, f"value_mismatch:{key}(got={got!r},want={expected!r})", outcomes

        fields_out[key] = {"value": expected, "surface": surface,
                           "start": start, "end": end, "is_impossible": False}

    record = {
        "spec_id": spec["spec_id"],
        "generator": spec["generator"],
        "template_code": spec["template_code"],
        "template_split": BY_CODE[spec["template_code"]]["split"],
        "text": text,
        "style": spec["style"],
        "fields": fields_out,
        "source_file": item.get("_source_file"),
    }
    return record, None, outcomes


HUMAN_SPLITS = ("test_human_seen", "test_human_unseen")


def assign_split(rec: dict, rng: random.Random) -> str:
    # Human-written rows NEVER enter train or dev. They are the only data in
    # the project not written by a language model, which makes them the only
    # honest measurement of real-world performance -- spending them on
    # training would destroy the one unbiased number you have.
    #
    # They are split in two so the 2x2 can be read off directly:
    #
    #                  LLM text            human text
    #   seen tpl       dev                 test_human_seen
    #   unseen tpl     test_zero_shot      test_human_unseen
    #
    # dev -> test_human_seen isolates the writing-style gap (does a model
    # trained on synthetic Arabic survive real Arabic?). dev -> test_zero_shot
    # isolates the unseen-template gap. test_human_unseen is both at once, and
    # is the closest thing to production.
    if rec["generator"] == "H":
        return ("test_human_unseen" if rec["template_split"] == "unseen"
                else "test_human_seen")
    if rec["template_split"] == "unseen":
        return "test_zero_shot"          # the experiment that proves the open-set claim
    if rec["generator"] == "C":
        return "test_style_shift"        # unseen generator = unseen writing style
    return "dev" if rng.random() < 0.13 else "train"


def build_squad(records):
    """SQuAD v2 layout: one question per field, is_impossible for absent fields."""
    data = []
    for rec in records:
        t = BY_CODE[rec["template_code"]]
        qas = []
        for f in t["fields"]:
            fo = rec["fields"][f["key"]]
            qa = {
                "id": f"{rec['spec_id']}::{f['key']}",
                "question": f["question_ar"],
                "is_impossible": fo["is_impossible"],
                "answers": [] if fo["is_impossible"] else [
                    {"text": fo["surface"], "answer_start": fo["start"]}
                ],
            }
            qas.append(qa)
        data.append({
            "title": rec["template_code"],
            "paragraphs": [{"context": rec["text"], "qas": qas}],
        })
    return {"version": "v2.0", "data": data}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="out")
    ap.add_argument("--seed", type=int, default=13)
    args = ap.parse_args()
    rng = random.Random(args.seed)

    specs = load_specs(args.out)
    items, bad_files = load_generations(args.out)

    kept, rejects = [], []
    reject_counts = collections.Counter()
    outcome_counts = collections.Counter()
    seen_hashes = {}
    dup_count = 0

    for item in items:
        spec = specs.get(item["spec_id"])
        if not spec:
            reject_counts["unknown_spec_id"] += 1
            rejects.append({"spec_id": item["spec_id"], "reason": "unknown_spec_id"})
            continue

        rec, reason, outcomes = verify_item(item, spec)
        for v in outcomes.values():
            outcome_counts[v] += 1

        if reason:
            reject_counts[reason.split("(")[0]] += 1
            rejects.append({"spec_id": item["spec_id"], "reason": reason, "text": item["text"]})
            continue

        h = normalize(re.sub(r"\s+", " ", rec["text"]))
        if h in seen_hashes:
            dup_count += 1
            reject_counts["duplicate_text"] += 1
            continue
        seen_hashes[h] = rec["spec_id"]

        rec["split"] = assign_split(rec, rng)
        kept.append(rec)

    # ---------------- write artefacts ----------------
    os.makedirs(f"{args.out}/dataset", exist_ok=True)

    with open(f"{args.out}/dataset/records.jsonl", "w", encoding="utf-8") as fh:
        for r in kept:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    by_split = collections.defaultdict(list)
    for r in kept:
        by_split[r["split"]].append(r)

    for split, rows in by_split.items():
        with open(f"{args.out}/dataset/classification_{split}.jsonl", "w", encoding="utf-8") as fh:
            for r in rows:
                fh.write(json.dumps(
                    {"text": r["text"], "template_code": r["template_code"],
                     "generator": r["generator"], "noise": r["style"]["noise"],
                     "register": r["style"]["register"]},
                    ensure_ascii=False) + "\n")
        with open(f"{args.out}/dataset/extraction_{split}.json", "w", encoding="utf-8") as fh:
            json.dump(build_squad(rows), fh, ensure_ascii=False, indent=1)

    # bi-encoder training pairs: (request text, template document)
    with open(f"{args.out}/dataset/pairs_train.jsonl", "w", encoding="utf-8") as fh:
        for r in by_split.get("train", []):
            fh.write(json.dumps(
                {"query": r["text"], "positive": template_document(BY_CODE[r["template_code"]])},
                ensure_ascii=False) + "\n")

    with open(f"{args.out}/dataset/template_docs.json", "w", encoding="utf-8") as fh:
        json.dump(
            [{"code": t["code"], "split": t["split"], "document": template_document(t)}
             for t in TEMPLATES],
            fh, ensure_ascii=False, indent=1)

    with open(f"{args.out}/dataset/rejects.jsonl", "w", encoding="utf-8") as fh:
        for r in rejects:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    # ---------------- report ----------------
    total = len(items)
    per_template = collections.Counter(r["template_code"] for r in kept)
    per_gen = collections.Counter(r["generator"] for r in kept)
    per_noise = collections.Counter(r["style"]["noise"] for r in kept)
    n_impossible = sum(1 for r in kept for f in r["fields"].values() if f["is_impossible"])
    n_answerable = sum(1 for r in kept for f in r["fields"].values() if not f["is_impossible"])

    lines = ["# Data generation report", "",
             f"- generated rows read: **{total}**",
             f"- kept: **{len(kept)}**  ({len(kept) / total:.1%})" if total else "- kept: 0",
             f"- rejected: **{total - len(kept)}**",
             f"- unparseable files: {len(bad_files)}", "",
             "## Span match outcomes", "",
             "| outcome | count | meaning |", "|---|---|---|",
             f"| exact | {outcome_counts['exact']} | literal substring |",
             f"| normalized | {outcome_counts['normalized']} | matched after diacritic/alef normalisation |",
             f"| inflected | {outcome_counts['inflected']} | attached prefix recovered (للسفارة ~ السفارة) |",
             f"| absent | {outcome_counts['absent']} | field deliberately omitted (no-answer example) |", "",
             "## Rejections", "", "| reason | count |", "|---|---|"]
    for reason, n in reject_counts.most_common():
        lines.append(f"| `{reason}` | {n} |")
    lines += ["", "> If the rejection rate exceeds ~10%, tighten the prompt before",
              "> generating more. A high `value_not_found` rate means the generator is",
              "> ignoring rule 3; a high `omitted_field_leaked` rate means it is ignoring",
              "> rule 4 and your no-answer examples are contaminated.", "",
              "## Splits", "", "| split | rows |", "|---|---|"]
    for split in ["train", "dev", "test_style_shift", "test_zero_shot",
                  "test_human_seen", "test_human_unseen"]:
        lines.append(f"| {split} | {len(by_split.get(split, []))} |")
    lines += ["", "## Balance", "",
              f"- answerable questions: {n_answerable}",
              f"- no-answer questions: {n_impossible} "
              f"({n_impossible / max(1, n_answerable + n_impossible):.1%} — target 15-25%)",
              f"- duplicates removed: {dup_count}", "",
              "| template | rows |", "|---|---|"]
    for code, n in per_template.most_common():
        lines.append(f"| {code} | {n} |")
    lines += ["", "| generator | rows |", "|---|---|"]
    for g, n in per_gen.most_common():
        lines.append(f"| {g} | {n} |")
    lines += ["", "| noise level | rows |", "|---|---|"]
    for g, n in per_noise.most_common():
        lines.append(f"| {g} | {n} |")

    with open(f"{args.out}/dataset/report.md", "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")

    print("\n".join(lines))

    # ---------------- leakage guard ----------------
    train_templates = {r["template_code"] for r in by_split.get("train", [])}
    unseen_codes = {t["code"] for t in TEMPLATES if t["split"] == "unseen"}
    leaked = train_templates & unseen_codes
    if leaked:
        raise SystemExit(f"LEAKAGE: held-out templates found in train: {sorted(leaked)}")

    # A human row in train or dev would silently inflate every number you
    # report. Fail loudly instead.
    for guarded in ("train", "dev"):
        human_leak = [r["spec_id"] for r in by_split.get(guarded, [])
                      if r["generator"] == "H"]
        if human_leak:
            raise SystemExit(
                f"LEAKAGE: {len(human_leak)} human-written rows found in "
                f"{guarded}: {sorted(human_leak)[:5]}")

    print("\nleakage guard: OK (no held-out template in train, "
          "no human rows in train/dev)")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""
Step 1 of the pipeline: sample structured specs, then emit LLM prompts.

This is REVERSE generation. We choose the field values first and ask the LLM
to write a natural Arabic request around them. The gold spans are therefore
known by construction -- no manual annotation anywhere in this project.

Usage:
    python -m ics_data.generate_specs --per-template 200 --generator A --out out

Produces:
    out/specs.jsonl              one line per request to be written
    out/prompts/<batch>.txt      ready-to-paste prompts (10 specs each)
    out/raw/                     empty; put the LLM replies here as <batch>.json

Run it once per generator family (A, B, C) with different --generator values
and DIFFERENT LLMs. Three families is the minimum: a single model has a
stylistic fingerprint, and training and testing on one model measures
recognition of that model rather than understanding of Arabic requests.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import random

from .templates import TEMPLATES, BY_CODE

# --------------------------------------------------------------------------
# Style axes -- varied explicitly so the model never learns one register
# --------------------------------------------------------------------------

REGISTERS = [
    ("formal", "عربية فصحى رسمية إدارية"),
    ("formal", "عربية فصحى رسمية إدارية"),
    ("semi", "عربية فصحى مبسطة شبه رسمية"),
    ("dialect", "لهجة شامية محكية (سورية)"),
]

LENGTHS = [
    ("short", "جملة واحدة قصيرة جداً"),
    ("medium", "جملتين إلى ثلاث جمل"),
    ("medium", "جملتين إلى ثلاث جمل"),
    ("long", "فقرة كاملة فيها مقدمة وختام"),
]

OPENINGS = [
    "أرجو من سيادتكم", "الرجاء", "أتقدم إليكم", "بدي", "لو سمحتو", "", "",
]

NOISE_LEVELS = [
    ("clean", "دون أي أخطاء إملائية"),
    ("clean", "دون أي أخطاء إملائية"),
    ("clean", "دون أي أخطاء إملائية"),
    ("light", "مع خطأ إملائي أو خطأين طبيعيين (تبديل حرف، تكرار حرف، دمج كلمتين)"),
    ("heavy", "مع عدة أخطاء إملائية وإهمال علامات الترقيم كما يكتب الناس على عجلة"),
]

# NOTE ON NOISE: only error types the preprocessor cannot erase are worth
# generating. Alef/ya/ta-marbuta variants are normalised away in arabic.py,
# so we do not ask for them -- we ask for word-level typos, spacing errors,
# dialect vocabulary and missing punctuation instead.

NUMERAL_STYLES = [
    ("western", "استخدم الأرقام الغربية (1 2 3)"),
    ("arabic", "استخدم الأرقام العربية الهندية (١ ٢ ٣)"),
    ("words", "اكتب الأعداد بالحروف (نسختين، خمسة أيام)"),
]

EXTRAS = [
    ("indirect", "لا تستخدم اسم الطلب الرسمي إطلاقاً؛ صف المطلوب بكلامك الخاص"),
    ("distractor", "اذكر جهة أو قيمة أخرى ثم انفِ أنها المقصودة (مثال: «ليس السفارة الفرنسية، بل ...»)"),
    ("codeswitch", "أدخِل كلمة إنكليزية أو كلمتين داخل النص (مثل transcript أو no-objection)"),
    ("apology", "ابدأ باعتذار أو شرح ظرف شخصي قبل الطلب"),
    ("urgency", "أظهِر استعجالاً واضحاً"),
    (None, None),
    (None, None),
]


def _sample_date(rng: random.Random) -> str:
    base = dt.date(2026, 8, 1)
    return (base + dt.timedelta(days=rng.randint(-120, 200))).isoformat()


def _sample_value(field: dict, rng: random.Random):
    pool = field.get("pool")
    if field["data_type"] == "DATE" or pool == "DATE":
        return _sample_date(rng)
    if field["data_type"] == "ENUM":
        return rng.choice(field["options"])["code"]
    return rng.choice(pool)


def _display(field: dict, value):
    """How the value should be described to the LLM."""
    if field["data_type"] == "ENUM":
        for opt in field["options"]:
            if opt["code"] == value:
                return opt["label_ar"]
        return str(value)
    if field["data_type"] == "BOOL":
        return "نعم" if value else "لا"
    return str(value)


def sample_spec(template: dict, rng: random.Random, spec_id: str, generator: str) -> dict:
    values, omitted = {}, []
    for f in template["fields"]:
        if rng.random() < f.get("present_rate", 0.7):
            values[f["key"]] = _sample_value(f, rng)
        else:
            omitted.append(f["key"])

    # Guarantee a healthy share of rows where at least one field is absent.
    # These become the SQuAD-v2 no-answer examples that stop the extractor
    # from guessing at fields the user never mentioned.
    if not omitted and len(template["fields"]) > 1 and rng.random() < 0.2:
        victim = rng.choice(list(values.keys()))
        omitted.append(victim)
        del values[victim]

    register, register_ar = rng.choice(REGISTERS)
    length, length_ar = rng.choice(LENGTHS)
    noise, noise_ar = rng.choice(NOISE_LEVELS)
    numerals, numerals_ar = rng.choice(NUMERAL_STYLES)
    extra, extra_ar = rng.choice(EXTRAS)

    return {
        "spec_id": spec_id,
        "generator": generator,
        "template_code": template["code"],
        "requester_type": template["requester_type"],
        "values": values,
        "omitted_fields": omitted,
        "style": {
            "register": register, "register_ar": register_ar,
            "length": length, "length_ar": length_ar,
            "noise": noise, "noise_ar": noise_ar,
            "numerals": numerals, "numerals_ar": numerals_ar,
            "extra": extra, "extra_ar": extra_ar,
            "opening": rng.choice(OPENINGS),
        },
    }


PROMPT_HEADER = """أنت مولّد بيانات لنظام مراسلات جامعي. مهمتك: كتابة طلبات إدارية عربية واقعية كما يكتبها طلاب وموظفون حقيقيون.

قواعد إلزامية:
1. لكل عنصر أعطيتك قيماً محددة. يجب أن تظهر كل قيمة داخل النص بمعناها الصحيح.
2. يُسمح 100% بإضافة حروف جر أو أدوات تعريف متصلة (مثلاً «للسفارة الألمانية» بدل «السفارة الألمانية»)، بل هو مطلوب ليكون النص طبيعياً.
3. لكن يجب أن تعيد لي في الحقل used_surface_forms الصيغة النصية الحرفية التي كتبتها فعلاً داخل النص لكل حقل، منسوخة حرفياً (copy-paste) من النص نفسه.
4. الحقول المذكورة تحت «احذف تماماً» يجب ألا تُذكر ولا يُلمّح إليها بأي شكل.
5. لا تكتب عنواناً ولا توقيعاً ولا اسماً ولا رقماً جامعياً. نص الطلب فقط.
6. لا تذكر اسم القالب الرسمي إلا إذا كان طبيعياً، ولا تكرر نفس الصياغة بين العناصر.
7. - اكتب السنوات ورموز المقررات والتواريخ بالأرقام دائماً (2024-2025 وليس «ألفين وأربعة وعشرين»).
  أما الأعداد الصغيرة (عدد النسخ، عدد الفصول) فيمكن كتابتها بالحروف.
8. أعد النتيجة كـ JSON صالح فقط، دون أي شرح خارجه، بالشكل:

{"items": [{"spec_id": "...", "text": "...", "used_surface_forms": {"field_key": "الصيغة كما وردت في النص"}}]}

العناصر المطلوبة:
"""


def render_spec(spec: dict) -> str:
    t = BY_CODE[spec["template_code"]]
    lines = [f"\n--- spec_id: {spec['spec_id']} ---",
             f"نوع الطلب: {t['name_ar']} — {t['description_ar']}",
             f"مقدم الطلب: {'طالب' if t['requester_type'] == 'STUDENT' else 'موظف'}"]
    if spec["values"]:
        lines.append("القيم التي يجب أن ترد في النص:")
        for f in t["fields"]:
            if f["key"] in spec["values"]:
                lines.append(f"  - {f['key']} ({f['label_ar']}): {_display(f, spec['values'][f['key']])}")
    if spec["omitted_fields"]:
        labels = [f["label_ar"] for f in t["fields"] if f["key"] in spec["omitted_fields"]]
        lines.append("احذف تماماً (لا تذكرها ولا تلمّح إليها): " + "، ".join(labels))
    st = spec["style"]
    lines.append(f"الأسلوب: {st['register_ar']} · {st['length_ar']} · {st['noise_ar']} · {st['numerals_ar']}")
    if st["opening"]:
        lines.append(f"ابدأ بـ: «{st['opening']}»")
    if st["extra_ar"]:
        lines.append(f"إضافة: {st['extra_ar']}")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-template", type=int, default=200)
    ap.add_argument("--generator", default="A", help="A, B or C -- use a DIFFERENT LLM for each")
    ap.add_argument("--batch-size", type=int, default=10)
    ap.add_argument("--out", default="out")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--include-unseen", action="store_true",
                    help="also generate for held-out templates 10-12 (zero-shot TEST set only)")
    ap.add_argument("--only-unseen", action="store_true",
                help="generate ONLY the held-out templates 10-12")
    args = ap.parse_args()

    rng = random.Random(args.seed if args.seed is not None else hash(args.generator) % 10_000)

    if args.only_unseen:
        templates = [t for t in TEMPLATES if t["split"] == "unseen"]
    elif args.include_unseen:
     templates = list(TEMPLATES)
    else:
        templates = [t for t in TEMPLATES if t["split"] == "seen"]

    os.makedirs(f"{args.out}/prompts", exist_ok=True)
    os.makedirs(f"{args.out}/raw", exist_ok=True)

    specs = []
    for t in templates:
        for i in range(args.per_template):
            sid = f"{args.generator}-{t['code']}-{i:04d}"
            specs.append(sample_spec(t, rng, sid, args.generator))

    rng.shuffle(specs)  # mix templates inside a batch so the LLM does not drift

    specs_path = f"{args.out}/specs_{args.generator}.jsonl"
    with open(specs_path, "w", encoding="utf-8") as fh:
        for s in specs:
            fh.write(json.dumps(s, ensure_ascii=False) + "\n")

    n_batches = 0
    for b in range(0, len(specs), args.batch_size):
        chunk = specs[b:b + args.batch_size]
        bid = f"{args.generator}_{b // args.batch_size:04d}"
        body = PROMPT_HEADER + "\n".join(render_spec(s) for s in chunk)
        with open(f"{args.out}/prompts/{bid}.txt", "w", encoding="utf-8") as fh:
            fh.write(body)
        n_batches += 1

    print(f"generator {args.generator}: {len(specs)} specs -> {specs_path}")
    print(f"{n_batches} prompt files in {args.out}/prompts/")
    print(f"paste each one into the LLM, save the JSON reply as {args.out}/raw/<batch_id>.json")


if __name__ == "__main__":
    main()

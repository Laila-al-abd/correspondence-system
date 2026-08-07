# -*- coding: utf-8 -*-
"""
Self-test: proves the verifier does the right thing on the three cases that
matter, without needing any LLM.

It fabricates generator replies covering:
  A  exact match
  B  inflected match  (للسفارة for السفارة)  -> must be KEPT
  C  wrong value      (الفرنسية for الألمانية) -> must be REJECTED
  D  leaked field     (mentions a field that was ordered omitted) -> REJECTED
  E  Arabic-Indic numerals + number words -> normalised correctly

Run:  python3 selftest.py
"""

import sys

sys.path.insert(0, ".")

from ics_data.arabic import find_span, norm_num, norm_date, norm_enum_with_hints, normalise_value
from ics_data.templates import BY_CODE, template_document
from ics_data.verify_and_build import verify_item

fails = []


def check(label, cond, detail=""):
    status = "PASS" if cond else "FAIL"
    print(f"[{status}] {label} {detail}")
    if not cond:
        fails.append(label)


print("=" * 70)
print("1. find_span")
print("=" * 70)

text_exact = "أرجو منحي شهادة عدم اعتراض لتقديمها إلى السفارة الألمانية"
hit = find_span(text_exact, "السفارة الألمانية")
check("exact match found", hit is not None and hit[3] == "exact", str(hit))
check("exact offsets slice back correctly",
      hit is not None and text_exact[hit[0]:hit[1]] == "السفارة الألمانية")

# THE case from the design discussion: naive find() returns -1 here
text_infl = "أرجو منحي شهادة عدم اعتراض لتقديمها للسفارة الألمانية خلال أسبوع"
check("naive str.find fails on inflected form",
      text_infl.find("السفارة الألمانية") == -1)
hit = find_span(text_infl, "السفارة الألمانية")
check("inflected form recovered", hit is not None, str(hit))
if hit:
    check("inflected surface is what the user actually wrote",
          text_infl[hit[0]:hit[1]] == hit[2],
          repr(hit[2]))

# genuinely different value must NOT be recovered
text_wrong = "أرجو منحي شهادة عدم اعتراض لتقديمها للسفارة الفرنسية"
check("wrong value correctly not found",
      find_span(text_wrong, "السفارة الألمانية") is None)

# diacritics and hamza variants
text_dia = "أَرجو إصدار إفادة قيد جامعيّ للمصرف التجاري السوري"
check("normalised match across diacritics",
      find_span(text_dia, "المصرف التجاري السوري") is not None)

print()
print("=" * 70)
print("2. normalisers (surface span -> canonical filledData value)")
print("=" * 70)

check("arabic-indic numerals", norm_num("٢ نسخ") == 2, norm_num("٢ نسخ"))
check("number word نسختين -> 2", norm_num("نسختين") == 2, norm_num("نسختين"))
check("western digits", norm_num("3 نسخ") == 3)
check("ISO date", norm_date("بتاريخ 2026-09-15") == "2026-09-15")
check("dd/mm/yyyy", norm_date("15/09/2026") == "2026-09-15")
check("arabic month name", norm_date("15 أيلول 2026") == "2026-09-15",
      norm_date("15 أيلول 2026"))

lang_field = next(f for f in BY_CODE["ENROLL_CERT"]["fields"] if f["key"] == "language")
check("enum بالإنكليزي -> EN",
      norm_enum_with_hints("بالإنكليزي", lang_field["options"]) == "EN",
      norm_enum_with_hints("بالإنكليزي", lang_field["options"]))
check("enum اللغة العربية -> AR",
      norm_enum_with_hints("اللغة العربية", lang_field["options"]) == "AR")

print()
print("=" * 70)
print("3. verify_item end to end")
print("=" * 70)

spec_ok = {
    "spec_id": "T-1", "generator": "A", "template_code": "NO_OBJECTION",
    "values": {"destination_entity": "السفارة الألمانية", "purpose": "إجراءات السفر"},
    "omitted_fields": ["travel_date"],
    "style": {"noise": "clean", "register": "formal"},
}

# B: inflected, must be KEPT with the real surface form as the gold span
item_b = {
    "spec_id": "T-1",
    "text": "أرجو منحي شهادة عدم اعتراض لتقديمها للسفارة الألمانية بغرض إجراءات السفر",
    "used_surface_forms": {"destination_entity": "للسفارة الألمانية", "purpose": "إجراءات السفر"},
}
rec, reason, outcomes = verify_item(item_b, spec_ok)
check("B inflected row kept", rec is not None, reason or "")
if rec:
    fo = rec["fields"]["destination_entity"]
    check("B gold span slices back to the inflected surface",
          item_b["text"][fo["start"]:fo["end"]] == fo["surface"], repr(fo["surface"]))
    check("B canonical value preserved for filledData",
          fo["value"] == "السفارة الألمانية")
    check("B omitted field marked unanswerable",
          rec["fields"]["travel_date"]["is_impossible"] is True)

# C: wrong value, must be REJECTED (never silently relabelled as absent)
item_c = {
    "spec_id": "T-1",
    "text": "أرجو منحي شهادة عدم اعتراض لتقديمها للسفارة الفرنسية بغرض إجراءات السفر",
    "used_surface_forms": {"destination_entity": "للسفارة الفرنسية", "purpose": "إجراءات السفر"},
}
rec_c, reason_c, _ = verify_item(item_c, spec_ok)
check("C wrong value rejected", rec_c is None and "destination_entity" in str(reason_c),
      str(reason_c))

# D: leaked omitted field
item_d = {
    "spec_id": "T-1",
    "text": "أرجو شهادة عدم اعتراض للسفارة الألمانية بغرض إجراءات السفر بتاريخ 2026-09-15",
    "used_surface_forms": {"destination_entity": "للسفارة الألمانية", "purpose": "إجراءات السفر",
                            "travel_date": "2026-09-15"},
}
rec_d, reason_d, _ = verify_item(item_d, spec_ok)
check("D leaked omitted field rejected", rec_d is None and "omitted_field_leaked" in str(reason_d),
      str(reason_d))

# E: numerals and enum inside a real row
spec_e = {
    "spec_id": "T-2", "generator": "A", "template_code": "ENROLL_CERT",
    "values": {"copies": 2, "language": "EN"},
    "omitted_fields": ["purpose", "destination_entity"],
    "style": {"noise": "light", "register": "dialect"},
}
item_e = {
    "spec_id": "T-2",
    "text": "بدي إفادة قيد جامعي نسختين بالإنكليزي لو سمحتو",
    "used_surface_forms": {"copies": "نسختين", "language": "بالإنكليزي"},
}
rec_e, reason_e, _ = verify_item(item_e, spec_e)
check("E dialect + number word + enum row kept", rec_e is not None, str(reason_e))
if rec_e:
    check("E copies span found", rec_e["fields"]["copies"]["value"] == 2)
    check("E language enum resolved", rec_e["fields"]["language"]["value"] == "EN")

print()
print("=" * 70)
print("4. template document (what the bi-encoder embeds)")
print("=" * 70)
doc = template_document(BY_CODE["NO_OBJECTION"])
print(doc[:300] + " ...")
check("template document is non-trivial", len(doc) > 200)

print()
print("=" * 70)
if fails:
    print(f"{len(fails)} FAILURES: {fails}")
    sys.exit(1)
print("ALL CHECKS PASSED")

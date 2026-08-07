# -*- coding: utf-8 -*-
"""
Arabic text utilities for the ICS data pipeline.

Pure standard library. No dependencies. Python 3.9+.

The single most important guarantee in this file: `normalize_with_map` returns
a normalised string *together with an index map back into the original string*.
Every span we report is therefore an offset into the RAW user text, never into
a cleaned-up copy of it. That is what makes the extraction labels usable.

Revision notes:
  r2  separator variants (slash, backslash, en-dash, em-dash) collapse to a
      plain hyphen, so an LLM writing 2024/2025 still matches the canonical
      value 2024-2025.
  r2  Arabic number words extended past ten, in BOTH the genitive/accusative
      form (اربعين) and the nominative form (اربعون), with compound support
      so "خمس واربعون" resolves to 45.
  r3  ENUM resolution reads the field's choices from "options" OR "pool"
      (templates.py uses both), matches inflection-tolerantly, and falls back
      to the surface form instead of returning None. Reading only "options"
      turned every pool-backed ENUM into an automatic value_mismatch.
"""

import re

__all__ = [
    "DIACRITICS", "TATWEEL", "ARABIC_INDIC", "EXT_ARABIC_INDIC",
    "PROCLITICS", "MONTHS_AR", "NUMBER_WORDS", "ENUM_HINTS",
    "normalize_with_map", "normalize", "normalize_digits", "arabic_ratio",
    "find_span", "norm_num", "norm_bool", "norm_date", "norm_enum",
    "norm_enum_with_hints", "normalise_value", "enum_choices",
]

# --------------------------------------------------------------------------
# Character-level constants
# --------------------------------------------------------------------------

DIACRITICS = re.compile(r"[\u064B-\u065F\u0670\u06D6-\u06ED]")
TATWEEL = "\u0640"
ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩"
EXT_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹"

# Single-letter clitics Arabic glues onto the front of a word.
PROCLITICS = "وفبكل"

# Every entry MUST be one character mapped to one character. The index map in
# `normalize_with_map` depends on that invariant; a one-to-many mapping would
# silently shift every offset after it.
_CHAR_MAP = {
    # alef variants
    "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",
    # ya / alef maqsura, ta marbuta, hamza carriers
    "ى": "ي", "ة": "ه", "ؤ": "و", "ئ": "ي",
    # Persian/Urdu lookalikes that show up in pasted text
    "ک": "ك", "گ": "ك", "ی": "ي", "ہ": "ه",
    # separator variants -> plain hyphen  (fix for academic_year 2024/2025)
    "/": "-", "\u005c": "-", "\u2013": "-", "\u2014": "-", "\u2212": "-", "\u2010": "-",
    # Arabic punctuation that is really just Latin punctuation
    "\u060c": ",", "\u061b": ";", "\u061f": "?",
}
for _i, _ch in enumerate(ARABIC_INDIC):
    _CHAR_MAP[_ch] = str(_i)
for _i, _ch in enumerate(EXT_ARABIC_INDIC):
    _CHAR_MAP[_ch] = str(_i)


# --------------------------------------------------------------------------
# Normalisation
# --------------------------------------------------------------------------

def normalize_with_map(text):
    """Normalise `text`, returning (normalised, index_map).

    index_map[i] is the offset in the ORIGINAL string of normalised char i.
    Characters dropped entirely (diacritics, tatweel) simply have no entry,
    which is what lets us map a match back to raw offsets.
    """
    chars = []
    index_map = []
    for i, ch in enumerate(text):
        if DIACRITICS.match(ch) or ch == TATWEEL:
            continue
        chars.append(_CHAR_MAP.get(ch, ch).lower())
        index_map.append(i)
    return "".join(chars), index_map


def normalize(text):
    """Normalised form only, offsets discarded."""
    return normalize_with_map(text)[0]


def normalize_digits(text):
    """Arabic-Indic and extended Arabic-Indic digits -> ASCII digits."""
    out = []
    for ch in text:
        if ch in ARABIC_INDIC:
            out.append(str(ARABIC_INDIC.index(ch)))
        elif ch in EXT_ARABIC_INDIC:
            out.append(str(EXT_ARABIC_INDIC.index(ch)))
        else:
            out.append(ch)
    return "".join(out)


def arabic_ratio(text):
    """Share of letters that are Arabic. Used to reject English-drift rows."""
    letters = [c for c in text if c.isalpha()]
    if not letters:
        return 0.0
    arabic = [c for c in letters if "\u0600" <= c <= "\u06FF"]
    return len(arabic) / len(letters)


# --------------------------------------------------------------------------
# Span location
# --------------------------------------------------------------------------

def _token_pattern(token):
    """Regex for one token, tolerating attached proclitics and a stripped ال."""
    core = token
    if core.startswith("ال") and len(core) > 3:
        core = core[2:]
    return r"[" + PROCLITICS + r"]{0,2}(?:ال)?" + re.escape(core)


def find_span(text, value):
    """Locate `value` inside `text`, tolerating Arabic surface variation.

    Returns (start, end, surface, how) with offsets into the RAW `text`, or
    None. `how` is one of "exact", "normalized", "inflected".
    """
    if not value:
        return None
    value = str(value)

    # 1. literal substring
    i = text.find(value)
    if i >= 0:
        return i, i + len(value), text[i:i + len(value)], "exact"

    ntext, imap = normalize_with_map(text)
    nvalue = normalize(value)
    if not nvalue.strip():
        return None

    # 2. equal after normalisation
    j = ntext.find(nvalue)
    if j >= 0:
        start = imap[j]
        end = imap[j + len(nvalue) - 1] + 1
        return start, end, text[start:end], "normalized"

    # 3. same tokens, but Arabic has glued prepositions or ال onto them
    tokens = [t for t in re.split(r"\s+", nvalue) if t]
    if not tokens:
        return None
    pattern = r"\s+".join(_token_pattern(t) for t in tokens)
    m = re.search(pattern, ntext)
    if m:
        start = imap[m.start()]
        end = imap[m.end() - 1] + 1
        return start, end, text[start:end], "inflected"

    return None


# --------------------------------------------------------------------------
# Value normalisers
# --------------------------------------------------------------------------

# Keys are in NORMALISED form: bare alef, ya for alef-maqsura, ha for
# ta-marbuta. Do not write ة or أ here, they would never be looked up.
NUMBER_WORDS = {
    "صفر": 0,
    "واحد": 1, "واحده": 1, "احد": 1,
    "اثنين": 2, "اثنتين": 2, "اثنان": 2, "نسختين": 2,
    "يومين": 2, "فصلين": 2, "مرتين": 2,
    "ثلاث": 3, "ثلاثه": 3,
    "اربع": 4, "اربعه": 4,
    "خمس": 5, "خمسه": 5,
    "ست": 6, "سته": 6,
    "سبع": 7, "سبعه": 7,
    "ثمان": 8, "ثمانيه": 8, "ثماني": 8,
    "تسع": 9, "تسعه": 9,
    "عشر": 10, "عشره": 10,
    "احدعش": 11, "اثنعش": 12, "اثناعش": 12,
}

# Tens, in both case endings. Arabic writers switch between them freely and
# the LLM will too: "خمس وأربعون" and "خمسة وأربعين" are the same 45.
for _stem, _val in [
    ("عشر", 20), ("ثلاث", 30), ("اربع", 40), ("خمس", 50),
    ("ست", 60), ("سبع", 70), ("ثمان", 80), ("تسع", 90),
]:
    NUMBER_WORDS[_stem + "ين"] = _val   # اربعين
    NUMBER_WORDS[_stem + "ون"] = _val   # اربعون
NUMBER_WORDS.update({"مئه": 100, "مائه": 100, "ميه": 100})


def _words_to_num(s):
    """Sum Arabic number words: "خمس واربعون" -> 45.

    Deliberately additive and deliberately dumb. If it guesses wrong the
    verifier reports a value_mismatch and the row is dropped; it can never
    quietly write a wrong label into your dataset.
    """
    values = []
    for token in s.split():
        token = token.strip(",;:.()«»\"'")
        if token in NUMBER_WORDS:
            values.append(NUMBER_WORDS[token])
        elif token.startswith("و") and token[1:] in NUMBER_WORDS:
            values.append(NUMBER_WORDS[token[1:]])
    if not values:
        return None
    if len(values) == 1:
        return values[0]
    return sum(values)


def norm_num(surface):
    """Surface -> int. Digits win; spelled-out Arabic is the fallback."""
    if surface is None:
        return None
    s = normalize(normalize_digits(str(surface)))
    m = re.search(r"\d+", s)
    if m:
        return int(m.group())
    return _words_to_num(s)


_TRUE_WORDS = {"نعم", "ايوه", "ايوا", "مطلوب", "موافق", "اريد",
               "بدي", "صحيح", "true", "yes", "1",
               # implicit affirmatives: the polarity is carried by the phrase
               # itself, never by a literal «نعم», because nobody writes that.
               "شامل", "متضمن", "بما فيها", "مع التعويضات", "تمويل"}
_FALSE_WORDS = {"لا", "كلا", "غير مطلوب", "لست", "ما بدي", "false", "no", "0"}

# Checked BEFORE _TRUE_WORDS. «غير شامل» contains «شامل», so a plain
# substring scan in _TRUE_WORDS order would read a negation as an affirmation.
_NEGATORS = ("دون", "بدون", "غير شامل", "لا تشمل", "ما عدا", "باستثناء")


def close_enough(a, b, budget=None):
    """True when `a` and `b` differ only by a spelling slip.

    The generators deliberately misspell values (الهربية for العربية) because
    real students do. The span is still the right answer and the gold value is
    still the canonical spelling, so this must not be a rejection.
    """
    a, b = normalize(str(a)).strip(), normalize(str(b)).strip()
    if not a or not b:
        return False
    if abs(len(a) - len(b)) > 3:
        return False
    if budget is None:
        budget = 1 if len(b) <= 6 else (2 if len(b) <= 14 else 3)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1,
                           prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1] <= budget


def norm_bool(surface):
    """Surface -> True / False / None."""
    if surface is None:
        return None
    if isinstance(surface, bool):
        return surface
    s = normalize(str(surface)).strip()
    if any(w in s for w in _NEGATORS):
        return False
    if s in _TRUE_WORDS or any(w in s for w in _TRUE_WORDS):
        return True
    if s in _FALSE_WORDS or any(w in s for w in _FALSE_WORDS):
        return False
    return None


# Month names in normalised form. Levantine first, Egyptian/Gulf second.
MONTHS_AR = {
    "كانون الثاني": 1, "شباط": 2, "اذار": 3, "نيسان": 4,
    "ايار": 5, "حزيران": 6, "تموز": 7, "اب": 8,
    "ايلول": 9, "تشرين الاول": 10, "تشرين الثاني": 11,
    "كانون الاول": 12,
    "يناير": 1, "فبراير": 2, "مارس": 3, "ابريل": 4,
    "مايو": 5, "يونيو": 6, "يوليو": 7, "اغسطس": 8,
    "سبتمبر": 9, "اكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12,
}

# English month names. `normalize` lowercases Latin text, so lowercase keys
# match "September", "SEPTEMBER" and "september" alike. Cheap insurance: the
# generators are told to write Arabic but they code-switch, and a date is the
# easiest thing in the world to slip into English.
for _i, _name in enumerate([
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
], start=1):
    MONTHS_AR[_name] = _i
    MONTHS_AR[_name[:3]] = _i          # jan, feb, mar ...
MONTHS_AR["sept"] = 9


def norm_date(surface):
    """Surface -> ISO "YYYY-MM-DD", or None.

    Handles 2026-09-15, 15-09-2026, 15/09/2026 (separators already collapsed
    to "-"), Arabic-Indic digits, and "15 أيلول 2026". Month+year with no day
    defaults to day 01.
    """
    if surface is None:
        return None
    s = normalize(normalize_digits(str(surface))).strip()

    m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31:
            return "%04d-%02d-%02d" % (y, mo, d)

    m = re.search(r"(\d{1,2})-(\d{1,2})-(\d{4})", s)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31:
            return "%04d-%02d-%02d" % (y, mo, d)

    # named month, longest name first so "تشرين الاول" wins over "اب"
    for name in sorted(MONTHS_AR, key=len, reverse=True):
        idx = s.find(name)
        if idx < 0:
            continue
        mo = MONTHS_AR[name]
        before, after = s[:idx], s[idx + len(name):]
        dm = re.search(r"(\d{1,2})\s*$", before)
        ym = re.search(r"(\d{4})", after) or re.search(r"(\d{4})", before)
        if ym:
            d = int(dm.group(1)) if dm else 1
            if 1 <= d <= 31:
                return "%04d-%02d-%02d" % (int(ym.group(1)), mo, d)
    return None


# Free-text hints -> canonical enum code, for cases where the writer never
# uses the option label itself. Keys are normalised substrings.
ENUM_HINTS = {
    "AR": ["عربي", "بالعرب", "arabic"],
    "EN": ["انكليز", "انجليز", "english"],
    "FR": ["فرنس", "french", "francais"],
    "S1": ["الفصل الاول", "فصل اول", "الاول"],
    "S2": ["الفصل الثاني", "فصل ثاني", "الثاني"],
    "SUMMER": ["الصيفي", "صيفي", "summer"],
    "MIDTERM": ["الفصلي", "نصفي", "midterm"],
    "FINAL": ["النهايي", "نهايي", "final"],
    "PRACTICAL": ["العملي", "عملي", "practical"],
    "ANNUAL": ["سنويه", "سنوي", "annual"],
    "SICK": ["مرضيه", "مرضي", "sick"],
    "UNPAID": ["بلا اجر", "بدون اجر", "unpaid"],
    "EMERGENCY": ["اضطراريه", "طاريه", "emergency"],
}


def _opt_code(opt):
    """Canonical code for one option.

    templates.py builds ENUM options with `_enum()`, which yields dicts of the
    form {"code": "S2", "label_ar": "الفصل الثاني"}. Plain strings are also
    accepted so the function stays usable with a simple list.
    """
    if isinstance(opt, dict):
        for key in ("code", "value", "id"):
            if opt.get(key):
                return opt[key]
        for key in sorted(opt):
            if key.startswith("label") and isinstance(opt[key], str):
                return opt[key]
        return None
    return opt


def _opt_labels(opt):
    """Human-readable surface labels for one option, excluding the code.

    The code is matched separately, by equality only. Allowing a short code
    like "AR" into substring matching would let it hit any Latin word that
    happens to contain those letters.
    """
    if isinstance(opt, dict):
        return [v for k, v in sorted(opt.items())
                if k.startswith("label") and isinstance(v, str) and v.strip()]
    return [str(opt)]


def enum_choices(field):
    """Pull the allowed values out of a field dict.

    templates.py declares choices under "options" for some fields and "pool"
    for others. Reading only one of those keys silently turns every field that
    uses the other into an unresolvable ENUM, which is exactly the bug this
    function exists to prevent.
    """
    for key in ("options", "pool", "values", "choices", "enum"):
        v = (field or {}).get(key)
        if isinstance(v, (list, tuple)) and v:
            return list(v)
    return None


def norm_enum(surface, options=None):
    """Match a surface form to one of `options`.

    `options` may be a list or a whole field dict. Argument order is tolerated
    in either direction so a legacy call site cannot break.
    """
    if isinstance(surface, (list, tuple)) and not isinstance(options, (list, tuple)):
        surface, options = options, surface
    if isinstance(options, dict):
        options = enum_choices(options)
    if isinstance(surface, dict) or surface is None or not options:
        return None
    s = normalize(str(surface)).strip()
    if not s:
        return None

    pairs = [(_opt_code(o), _opt_labels(o)) for o in options]

    # 1. equality, against the code or any label
    for code, labels in pairs:
        if code is not None and s == normalize(str(code)).strip():
            return code
        for lab in labels:
            if s == normalize(lab).strip():
                return code

    # Longest label first: "الامتحان النهائي" must beat a bare "نهائي".
    flat = [(code, lab) for code, labels in pairs for lab in labels]
    flat.sort(key=lambda cl: len(cl[1]), reverse=True)

    # 2. containment in either direction
    for code, lab in flat:
        n = normalize(lab).strip()
        if n and (n in s or s in n):
            return code

    # 3. inflection tolerant: "بالفصل الثاني" -> S2
    for code, lab in flat:
        if find_span(str(surface), lab) or find_span(lab, str(surface)):
            return code

    # 4. spelling slip. «الهربية» is «العربية» with one wrong letter, and
    #    real students do that. Without this an ENUM whose surface is
    #    misspelt resolves to None and the whole field is dropped: the
    #    38 value_mismatch:language rejections in the build report.
    #    budget=1: ONE wrong letter only. At the default budget
    #    «الامتحان الفصلي» and «الامتحان العملي» collide, which would
    #    silently mislabel exam_type. Longest label first, so a near-match on
    #    a long label beats a coincidental one on a short label.
    for code, lab in flat:
        if close_enough(s, normalize(lab).strip(), budget=1):
            return code
    return None


def norm_enum_with_hints(surface, options=None):
    """norm_enum, falling back to ENUM_HINTS for indirect phrasing.

    "بالإنكليزي" never contains the option code "EN", but it clearly means it.
    """
    if isinstance(surface, (list, tuple)) and not isinstance(options, (list, tuple)):
        surface, options = options, surface
    if isinstance(options, dict):
        options = enum_choices(options)
    if surface is None:
        return None

    direct = norm_enum(surface, options) if options else None
    if direct is not None:
        return direct

    s = normalize(str(surface))
    codes = [_opt_code(o) for o in options] if options else None
    for code, hints in ENUM_HINTS.items():
        if codes and code not in codes:
            continue
        for hint in hints:
            if hint in s:
                return code
    return None


def normalise_value(field, surface):
    """Dispatch on the field's data_type. Returns the canonical value.

    `field` is a field dict from templates.py. Argument order is tolerated in
    either direction so an older call site cannot break.
    """
    if isinstance(surface, dict) and not isinstance(field, dict):
        field, surface = surface, field
    if surface is None:
        return None

    dtype = (field or {}).get("data_type", "TEXT")
    if dtype == "NUM":
        return norm_num(surface)
    if dtype == "DATE":
        return norm_date(surface)
    if dtype == "BOOL":
        return norm_bool(surface)
    if dtype == "ENUM":
        resolved = norm_enum_with_hints(surface, enum_choices(field))
        # An ENUM we cannot map is NOT a failure. Fall back to the surface as
        # written and let the verifier compare it against the expected value.
        # Returning None here rejects the row outright, which is what caused
        # the from_semester / exam_type / semester mismatches.
        return str(surface).strip() if resolved is None else resolved
    return str(surface).strip()

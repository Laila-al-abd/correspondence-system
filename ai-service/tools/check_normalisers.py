# -*- coding: utf-8 -*-
"""Print exactly what arabic.py does with the values the API contract claims.

The backend is about to choose a dataType per column based on what the AI
service promises to send. Those promises should be observed, not assumed.

    python tools\\check_normalisers.py
"""
import argparse
import importlib.util
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def show(label, fn, *a):
    try:
        v = fn(*a)
        print('  %-34s -> %-24r %s' % (label, v, type(v).__name__))
    except Exception as exc:
        print('  %-34s -> RAISED %s: %s' % (label, type(exc).__name__, exc))


def main():
    ap = argparse.ArgumentParser()
    d = ROOT / 'data-gen' / 'ics_data'
    ap.add_argument('--arabic-py', default=str(d / 'arabic.py'))
    ap.add_argument('--templates-py', default=str(d / 'templates.py'))
    args = ap.parse_args()

    ar = load(args.arabic_py, '_ar')
    tp = load(args.templates_py, '_tp')

    print('=== norm_num ===')
    for s in ['\u0646\u0633\u062e\u062a\u064a\u0646', '\u0663', '3', '\u062b\u0644\u0627\u062b \u0646\u0633\u062e', 'abc']:
        show(s, ar.norm_num, s)

    print('\n=== norm_date ===')
    for s in ['\u0662\u0660\u0662\u0666-\u0667-\u0661\u0665', '2026-6-30', '15/9/2026',
              '\u0661\u0665 \u0623\u064a\u0644\u0648\u0644',
              '\u0645\u0646\u062a\u0635\u0641 \u0623\u064a\u0644\u0648\u0644',
              '\u0628\u0639\u062f \u0623\u0633\u0628\u0648\u0639']:
        show(s, ar.norm_date, s)

    print('\n=== norm_bool ===')
    for s in ['\u0634\u0627\u0645\u0644\u0629 \u0627\u0644\u062a\u0639\u0648\u064a\u0636\u0627\u062a',
              '\u062f\u0648\u0646 \u0627\u0644\u062a\u0639\u0648\u064a\u0636\u0627\u062a',
              '\u0646\u0639\u0645', '\u0644\u0627', '\u0631\u0628\u0645\u0627']:
        show(s, ar.norm_bool, s)

    print('\n=== ENUM fields, per template ===')
    templates = None
    for v in vars(tp).values():
        if isinstance(v, (list, tuple)) and v and all(
                isinstance(x, dict) and 'fields' in x for x in v):
            templates = v
            break
    if templates is None:
        print('  could not locate TEMPLATES')
        return 1

    probes = ['\u0627\u0644\u0625\u0646\u0643\u0644\u064a\u0632\u064a\u0629',
              '\u0627\u0644\u0627\u0646\u0643\u0644\u064a\u0632\u064a\u0647',
              '\u0628\u0627\u0644\u0625\u0646\u0643\u0644\u064a\u0632\u064a',
              '\u0627\u0644\u0647\u0631\u0628\u064a\u0629',
              '\u0634\u064a\u0621 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f']

    for t in templates:
        for f in t['fields']:
            if f.get('data_type') != 'ENUM':
                continue
            ch = ar.enum_choices(f)
            codes = [ar._opt_code(o) for o in (ch or [])]
            print('\n%s.%s  codes=%s' % (t['code'], f['key'], codes))
            for p in probes:
                show(p, ar.normalise_value, f, p)

    print('\n=== normalise_value on non-ENUM fields ===')
    for t in templates:
        for f in t['fields']:
            dt = f.get('data_type')
            if dt in ('ENUM', 'TEXT') or dt is None:
                continue
            print('\n%s.%s  data_type=%s' % (t['code'], f['key'], dt))
            if dt == 'NUM':
                cases = ['\u0646\u0633\u062e\u062a\u064a\u0646', '\u0663', 'zzz']
            elif dt == 'DATE':
                cases = ['\u0662\u0660\u0662\u0666-\u0667-\u0661\u0665',
                         '\u0661\u0665 \u0623\u064a\u0644\u0648\u0644', 'zzz']
            else:
                cases = ['\u0634\u0627\u0645\u0644\u0629 \u0627\u0644\u062a\u0639\u0648\u064a\u0636\u0627\u062a',
                         '\u062f\u0648\u0646 \u0627\u0644\u062a\u0639\u0648\u064a\u0636\u0627\u062a', 'zzz']
            for c in cases:
                show(c, ar.normalise_value, f, c)

    print('\nWhat to look for:')
    print('  - a date with no year: does it return None, or invent a year?')
    print('  - garbage input: None is correct; anything else is a problem')
    print('  - ENUM garbage: normalise_value falls back to the RAW SURFACE by')
    print('    design, so the service must check membership itself')
    return 0


if __name__ == '__main__':
    sys.exit(main())

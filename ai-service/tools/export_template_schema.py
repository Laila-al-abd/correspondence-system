# -*- coding: utf-8 -*-
"""Emit the authoritative template/field schema for backend seeding.

v3 - corrected. Earlier versions GUESSED the field type from the key name.
templates.py declares it explicitly as `data_type`, and that declaration is
the one the generator, the verifier and arabic.normalise_value all dispatch
on. Guessing when the answer is written down is how two systems end up
disagreeing about what a field is.

Authority order:
  data_type      templates.py, verbatim   (NUM/BOOL/DATE/ENUM/TEXT)
  question_ar    templates.py, verbatim, cross-checked against the dataset
  options        templates.py, via the same key list arabic.enum_choices uses
  document       template_docs.json, verbatim (this is what was embedded)

    python tools\\export_template_schema.py
"""
import argparse
import collections
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

SQUAD = ['extraction_train.json', 'extraction_dev.json',
         'extraction_test_zero_shot.json', 'extraction_test_style_shift.json']

# templates.py spelling  ->  the backend's dataType enum
DTYPE_MAP = {
    'TEXT': 'TEXT',
    'NUM': 'NUMBER',
    'DATE': 'DATE',
    'BOOL': 'BOOLEAN',
    'ENUM': 'ENUM',
}

# Same key list as arabic.enum_choices, in the same order.
CHOICE_KEYS = ('options', 'pool', 'values', 'choices', 'enum')

WARN = []


def load_module(path, name):
    if not Path(path).exists():
        return None
    try:
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    except Exception as exc:
        WARN.append('could not import %s (%s)' % (Path(path).name, exc))
        return None


def find_templates(mod, path):
    for value in vars(mod).values():
        if isinstance(value, (list, tuple)) and value:
            if all(isinstance(v, dict) and 'fields' in v and 'code' in v
                   for v in value):
                return {v['code']: v for v in value}
    for value in vars(mod).values():
        if isinstance(value, dict) and value:
            got = {k: v for k, v in value.items()
                   if isinstance(k, str) and isinstance(v, dict) and 'fields' in v}
            if got:
                return got
    raise SystemExit('could not find the template table inside %s' % path)


def raw_choices(field):
    for key in CHOICE_KEYS:
        v = (field or {}).get(key)
        if isinstance(v, (list, tuple)) and v:
            return list(v)
    return None


def build_options(field, code, key, arabic):
    """Only ever called for ENUM fields. Codes come from arabic._opt_code."""
    raw = raw_choices(field)
    if not raw:
        WARN.append('%s.%s: declared ENUM but no options/pool found' % (code, key))
        return []

    opt_code = getattr(arabic, '_opt_code', None) if arabic else None
    opt_labels = getattr(arabic, '_opt_labels', None) if arabic else None

    out, plain = [], 0
    for o in raw:
        if callable(opt_code) and callable(opt_labels):
            c = opt_code(o)
            labels = opt_labels(o)
            label = labels[0] if labels else None
        elif isinstance(o, dict):
            c = o.get('code') or o.get('value') or o.get('id')
            label = o.get('label_ar') or o.get('label')
        else:
            c, label = o, o
        if isinstance(o, dict) and c == label:
            plain += 1
        elif not isinstance(o, dict):
            plain += 1
        out.append({'code': c, 'labelAr': label})

    if plain:
        WARN.append('%s.%s: %d of %d options have no distinct code; the Arabic '
                    'label is the stored value (no code invented)'
                    % (code, key, plain, len(out)))
    return out


def load_questions(dataset_dir):
    qs = collections.defaultdict(collections.Counter)
    seen = []
    for name in SQUAD:
        p = Path(dataset_dir) / name
        if not p.exists():
            continue
        seen.append(name)
        blob = json.loads(p.read_text(encoding='utf-8'))
        for art in blob['data']:
            for para in art['paragraphs']:
                for qa in para['qas']:
                    qs[(art['title'], qa['id'].split('::')[-1])][qa['question']] += 1
    return qs, seen


def main():
    ap = argparse.ArgumentParser()
    d = ROOT / 'data-gen'
    ap.add_argument('--templates-py', default=str(d / 'ics_data' / 'templates.py'))
    ap.add_argument('--arabic-py', default=str(d / 'ics_data' / 'arabic.py'))
    ap.add_argument('--dataset', default=str(d / 'out' / 'dataset'))
    ap.add_argument('--out-json', default=str(ROOT / 'models' / 'template_schema.json'))
    ap.add_argument('--out-md', default=str(ROOT / 'models' / 'template_schema.md'))
    ap.add_argument('--required-at', type=float, default=1.0)
    args = ap.parse_args()

    tpl_mod = load_module(args.templates_py, '_tpl')
    if tpl_mod is None:
        raise SystemExit('templates.py not found at %s' % args.templates_py)
    templates = find_templates(tpl_mod, args.templates_py)
    print('read %d templates from templates.py' % len(templates))

    arabic = load_module(args.arabic_py, '_arabic')
    print('arabic.py: %s' % ('loaded' if arabic else 'NOT loaded - codes may be wrong'))

    questions, files_seen = load_questions(args.dataset)
    print('dataset questions from: %s' % (', '.join(files_seen) or 'NOTHING FOUND'))

    docs = {}
    dp = Path(args.dataset) / 'template_docs.json'
    if dp.exists():
        for row in json.loads(dp.read_text(encoding='utf-8')):
            docs[row['code']] = row['document']
        print('read %d classifier documents' % len(docs))
    else:
        WARN.append('template_docs.json not found - classifierDocument will be null')

    out = []
    counts = collections.Counter()

    for code in sorted(templates):
        t = templates[code]
        entry = {
            'code': code,
            'nameAr': t.get('name_ar'),
            'nameEn': t.get('name_en'),
            'descriptionAr': t.get('description_ar'),
            'requesterType': t.get('requester_type'),
            'classifierDocument': docs.get(code),
            'split': t.get('split'),
            'fields': [],
        }
        if code not in docs:
            WARN.append('%s: no entry in template_docs.json' % code)

        for f in t.get('fields', []):
            key = f.get('key')
            if not key:
                WARN.append('%s: a field has no key (keys: %s)' % (code, sorted(f)))
                continue

            raw_dtype = f.get('data_type')
            if raw_dtype is None:
                WARN.append('%s.%s: no data_type declared; defaulting to TEXT'
                            % (code, key))
                raw_dtype = 'TEXT'
            dtype = DTYPE_MAP.get(raw_dtype)
            if dtype is None:
                WARN.append('%s.%s: unknown data_type %r; sending as TEXT'
                            % (code, key, raw_dtype))
                dtype = 'TEXT'
            counts[dtype] += 1

            options = build_options(f, code, key, arabic) if dtype == 'ENUM' else []

            declared_q = f.get('question_ar')
            counter = questions.get((code, key))
            dataset_q = counter.most_common(1)[0][0] if counter else None

            if declared_q and dataset_q and declared_q != dataset_q:
                WARN.append('%s.%s: templates.py question_ar differs from the '
                            'question in the dataset. Using the DATASET one, '
                            'because that is what the model was trained on.\n'
                            '        templates.py: %s\n'
                            '        dataset     : %s'
                            % (code, key, declared_q, dataset_q))
            if counter and len(counter) > 1:
                WARN.append('%s.%s: %d question variants in the dataset; using the '
                            'most common (%d of %d)'
                            % (code, key, len(counter),
                               counter.most_common(1)[0][1], sum(counter.values())))
            question = dataset_q or declared_q
            if not question:
                WARN.append('%s.%s: NO QUESTION anywhere' % (code, key))

            rate = f.get('present_rate', 1.0)
            entry['fields'].append({
                'key': key,
                'labelAr': f.get('label_ar'),
                'labelEn': f.get('label_en'),
                'type': dtype,
                'dataTypeRaw': raw_dtype,
                'required': bool(rate >= args.required_at),
                'presentRate': rate,
                'options': options,
                'extractionQuestion': question,
                'questionSource': 'dataset' if dataset_q else 'templates.py',
            })
        out.append(entry)

    jp = Path(args.out_json)
    jp.parent.mkdir(parents=True, exist_ok=True)
    jp.write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('wrote %s' % jp)

    L = ['# Template and field schema', '',
         'Generated by `tools/export_template_schema.py` v3.', '',
         '- `type` is read from `data_type` in templates.py, not inferred.',
         '  NUM maps to NUMBER and BOOL maps to BOOLEAN; everything else is 1:1.',
         '- **Do not hand-edit `extractionQuestion`.** Those strings are model',
         '  inputs taken verbatim from the training data.',
         '- **Do not hand-edit `classifierDocument`.** That exact text produced',
         '  the 99.11% zero-shot figure.',
         '- `required` is derived from `present_rate`, a data statistic, not',
         '  registrar policy. Confirm each one.', '']
    for e in out:
        L.append('## %s - %s' % (e['code'], e['nameAr'] or ''))
        L.append('')
        L.append('- nameEn: %s' % (e['nameEn'] or ''))
        L.append('- split: `%s`' % e['split'])
        L.append('')
        if e['classifierDocument']:
            L += ['**classifierDocument** (seed verbatim):', '', '```',
                  e['classifierDocument'], '```', '']
        L.append('| key | labelAr | type | required | options | extractionQuestion |')
        L.append('| --- | --- | --- | --- | --- | --- |')
        for f in e['fields']:
            opts = '، '.join('`%s` = %s' % (o['code'], o['labelAr'])
                              for o in f['options']) if f['options'] else ''
            L.append('| `%s` | %s | %s | %s | %s | %s |' % (
                f['key'], f['labelAr'] or '', f['type'],
                'yes' if f['required'] else 'no', opts,
                f['extractionQuestion'] or '**MISSING**'))
        L.append('')
    Path(args.out_md).write_text('\n'.join(L), encoding='utf-8')
    print('wrote %s' % args.out_md)

    nf = sum(len(e['fields']) for e in out)
    nq = sum(1 for e in out for f in e['fields'] if f['extractionQuestion'])
    print('\n%d templates, %d fields, %d questions resolved' % (len(out), nf, nq))
    print('types: %s' % ', '.join('%s %d' % kv for kv in sorted(counts.items())))

    if WARN:
        print('\nWARNINGS (%d):' % len(WARN))
        for w in WARN:
            print('  - %s' % w)
        return 1
    print('no warnings')
    return 0


if __name__ == '__main__':
    sys.exit(main())

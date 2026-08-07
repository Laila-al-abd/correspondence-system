# -*- coding: utf-8 -*-
"""Build models/template_map.json : template CODE -> backend template UUID.

The classifier predicts a stable code (ENROLL_CERT, TRANSCRIPT, ...).
POST /requests/:id/classify/model requires the UUID of a `templates` row.
This script bridges the two, and never guesses: anything it cannot resolve
with confidence is written as null for you to fill by hand.

Standalone - only needs httpx. Does not import the ics_ai package.

    python tools\\fetch_template_ids.py
    python tools\\fetch_template_ids.py --print-only
"""
import argparse
import importlib.util
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

try:
    import httpx
except ImportError:
    httpx = None

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

# Fallback hints, used only when templates.py cannot be read. Deliberately
# short substrings, matched against the Arabic template name.
HINTS = {
    'ENROLL_CERT': ['افاده قيد', 'اثبات قيد'],
    'TRANSCRIPT': ['كشف علامات', 'كشف درجات'],
    'NO_OBJECTION': ['عدم ممانعه'],
    'MILITARY_DEFER': ['تاجيل الخدمه', 'تاجيل خدمه'],
    'STUDY_WITHDRAWAL': ['انقطاع', 'انسحاب'],
    'CHANGE_MAJOR': ['نقل اختصاص', 'تغيير اختصاص'],
    'GRADE_APPEAL': ['اعتراض', 'مراجعه علامه'],
    'SALARY_CERT': ['كتاب تعريف', 'افاده راتب', 'تعريف براتب'],
    'ID_REPLACEMENT': ['بطاقه جامعيه', 'بدل فاقد'],
    'PROVISIONAL_GRAD': ['تخرج مؤقت', 'افاده تخرج'],
    'CONFERENCE': ['مؤتمر'],
    'ADMIN_LEAVE': ['اجازه اداريه', 'اجازه'],
}
CODES = list(HINTS.keys())

_DIAC = re.compile(r'[\u064B-\u0652\u0670\u0640]')


def nrm(s):
    """Loose Arabic normalisation for matching only - never for storage."""
    s = unicodedata.normalize('NFKC', s or '')
    s = _DIAC.sub('', s)
    for a, b in (('\u0623', '\u0627'), ('\u0625', '\u0627'), ('\u0622', '\u0627'),
                 ('\u0649', '\u064a'), ('\u0629', '\u0647')):
        s = s.replace(a, b)
    s = re.sub(r'[^\w\s]', ' ', s)
    return ' '.join(s.split())


def load_env(path):
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def names_from_templates_py(path):
    """code -> name_ar, read from the generator's templates.py if present.

    Authoritative, because it is the same file the dataset was built from.
    """
    if not path.exists():
        return {}
    try:
        spec = importlib.util.spec_from_file_location('_tpl', path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
    except Exception as exc:
        print('could not import %s (%s) - falling back to hints' % (path.name, exc))
        return {}

    out = {}
    for value in vars(mod).values():
        if isinstance(value, dict):
            for k, v in value.items():
                if isinstance(k, str) and isinstance(v, dict) and 'name_ar' in v:
                    out[k] = v['name_ar']
        elif isinstance(value, (list, tuple)):
            for v in value:
                if isinstance(v, dict) and 'name_ar' in v and 'code' in v:
                    out[v['code']] = v['name_ar']
        if out:
            break
    return out


def login(client, base, email, password):
    r = client.post(base + '/auth/login', json={'email': email, 'password': password})
    r.raise_for_status()
    body = r.json()
    for key in ('accessToken', 'access_token', 'token'):
        if key in body:
            return body[key]
    raise SystemExit('login succeeded but no token field found in: %s' % list(body))


def fetch_templates(client, base, token):
    headers = {'Authorization': 'Bearer ' + token}
    for path in ('/templates', '/templates?limit=200'):
        r = client.get(base + path, headers=headers)
        if r.status_code == 404:
            continue
        if r.status_code == 403:
            raise SystemExit(
                '403 from GET %s.\n'
                'Either the service account lacks template.read, or the AI host\n'
                'is not in STAFF_IP_ALLOWLIST. See section 5 of the backend handoff.'
                % path)
        r.raise_for_status()
        body = r.json()
        items = body.get('items', body) if isinstance(body, dict) else body
        if isinstance(items, list):
            return items
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(ROOT / 'models' / 'template_map.json'))
    ap.add_argument('--env', default=str(ROOT / '.env'))
    ap.add_argument('--templates-py',
                    default=str(ROOT / 'data-gen' / 'ics_data' / 'templates.py'))
    ap.add_argument('--print-only', action='store_true',
                    help='show what the backend returned, write nothing')
    args = ap.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    existing = {}
    if out_path.exists():
        try:
            existing = json.loads(out_path.read_text(encoding='utf-8'))
        except Exception:
            existing = {}

    name_by_code = names_from_templates_py(Path(args.templates_py))
    if name_by_code:
        print('read %d template names from templates.py' % len(name_by_code))
    else:
        print('using built-in name hints')

    env = load_env(Path(args.env))
    base = (env.get('BACKEND_URL') or os.environ.get('BACKEND_URL') or '').rstrip('/')
    email = env.get('AI_SERVICE_EMAIL') or os.environ.get('AI_SERVICE_EMAIL')
    password = env.get('AI_SERVICE_PASSWORD') or os.environ.get('AI_SERVICE_PASSWORD')

    rows = None
    if not (base and email and password):
        print('\nno backend credentials in %s - skipping the API call' % args.env)
    elif httpx is None:
        print('\nhttpx is not installed - skipping the API call')
        print('    pip install httpx python-dotenv')
    else:
        print('\nlogging in to %s ...' % base)
        try:
            with httpx.Client(timeout=20.0) as client:
                token = login(client, base, email, password)
                rows = fetch_templates(client, base, token)
        except httpx.HTTPStatusError as exc:
            print('HTTP %s from %s' % (exc.response.status_code, exc.request.url))
            print(exc.response.text[:400])
        except Exception as exc:
            print('could not reach the backend: %s' % exc)

    resolved, ambiguous = {}, {}

    if rows is None:
        print('\nGET /templates is not available.')
        print('This is item 1 in the backend handoff. Until it exists, fill the')
        print('UUIDs by hand from Prisma Studio (localhost:5555 -> templates).')
    else:
        print('backend returned %d templates\n' % len(rows))
        print('%-38s %s' % ('id', 'name'))
        for r in rows:
            print('%-38s %s' % (r.get('id'), r.get('nameAr') or r.get('name') or ''))

        # 1. exact match on a `code` field, if the backend has one
        by_code = {r.get('code'): r.get('id') for r in rows if r.get('code')}
        for c in CODES:
            if by_code.get(c):
                resolved[c] = by_code[c]

        # 2. otherwise match on the Arabic name
        for c in CODES:
            if c in resolved:
                continue
            needles = [nrm(name_by_code[c])] if c in name_by_code else \
                      [nrm(h) for h in HINTS[c]]
            hits = []
            for r in rows:
                hay = nrm(r.get('nameAr') or r.get('name') or '')
                if not hay:
                    continue
                if any(n and (n == hay or n in hay or hay in n) for n in needles):
                    hits.append(r.get('id'))
            if len(hits) == 1:
                resolved[c] = hits[0]
            elif len(hits) > 1:
                ambiguous[c] = hits

    mapping = {}
    for c in CODES:
        mapping[c] = resolved.get(c) or existing.get(c) or None

    print('\n%-20s %s' % ('CODE', 'UUID'))
    for c in CODES:
        v = mapping[c]
        note = ''
        if c in ambiguous:
            note = '   AMBIGUOUS: %s' % ', '.join(ambiguous[c])
        elif v and c in resolved:
            note = '   (from backend)'
        elif v:
            note = '   (kept from existing file)'
        print('%-20s %s%s' % (c, v or '<MISSING>', note))

    missing = [c for c in CODES if not mapping[c]]
    print('\nresolved %d / %d' % (len(CODES) - len(missing), len(CODES)))

    if args.print_only:
        print('\n--print-only: nothing written')
        return 0

    out_path.write_text(json.dumps(mapping, indent=2, ensure_ascii=False) + '\n',
                        encoding='utf-8')
    print('wrote %s' % out_path)

    if missing:
        print('\nSTILL MISSING: %s' % ', '.join(missing))
        print('Open Prisma Studio (localhost:5555), table `templates`, copy the id')
        print('for each one into that file. A code left null is skipped by the')
        print('worker - never guessed.')
        return 1
    print('\nAll twelve resolved. The worker can submit classifications.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

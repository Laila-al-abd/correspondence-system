# -*- coding: utf-8 -*-
"""Choose the absolute similarity floor from data, not from a hunch.

Companion to measure_threshold.py. That script calibrates `threshold`, the
auto-accept boundary applied to the calibrated confidence. This one calibrates
`cosine_threshold`, the absolute floor below which the reported confidence is
capped at the raw similarity that produced it.

Why the floor exists at all: softmax at the training temperature (0.05) divides
the scores by twenty, which sharpens small *relative* gaps into near-certainty
even when no candidate is a real match. Out-of-catalogue text still lands
slightly closer to one template document than to another, and the softmax will
happily report 0.97 for it. The floor asks the other, absolute question -- is
the best match similar at all -- and when the answer is no, the reported
confidence collapses to the raw cosine, falls under `threshold`, and the request
goes to a human. The cap uses min(), so the floor can only ever LOWER a
confidence. Its worst failure mode is extra reviewer work, never a wrong
auto-accept.

What this script measures:

  in-catalogue   dev + style_shift rows, whose true template IS in the
                 catalogue. Clamping these is a false clamp: harmless but it
                 costs reviewer time.
  out-of-scope   zero_shot rows scored against a catalogue with the unseen
                 template documents REMOVED, so their true answer is genuinely
                 absent. This is the traffic the floor exists for.

It prints both top-1 cosine distributions, sweeps the floor, and reports at each
candidate value: how many in-catalogue rows would be needlessly clamped, and how
many out-of-scope rows the floor sends to review that the threshold alone would
have auto-accepted. Then it picks the highest floor whose false-clamp rate stays
within a stated budget.

Standalone -- torch + transformers only. Touches no database and no service.

    python tools\\measure_cosine_floor.py ..\\data-gen\\out\\dataset
    python tools\\measure_cosine_floor.py ..\\data-gen\\out\\dataset --write
"""
import argparse
import json
import sys
from pathlib import Path

import torch
from transformers import AutoModel, AutoTokenizer

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

IN_CATALOGUE = [
    ('dev', 'classification_dev.jsonl'),
    ('style_shift', 'classification_test_style_shift.jsonl'),
]
OUT_OF_SCOPE = [
    ('zero_shot', 'classification_test_zero_shot.jsonl'),
]


def read_jsonl(path):
    with open(path, encoding='utf-8') as fh:
        return [json.loads(l) for l in fh if l.strip()]


def quantiles(values):
    v = sorted(values)
    if not v:
        return {}
    def q(p):
        return v[min(len(v) - 1, max(0, int(round(p * (len(v) - 1)))))]
    return {'min': v[0], 'p01': q(0.01), 'p05': q(0.05), 'p25': q(0.25),
            'median': q(0.50), 'p95': q(0.95), 'max': v[-1],
            'mean': sum(v) / len(v)}


def show(label, values):
    s = quantiles(values)
    if not s:
        print('%-14s (no rows)' % label)
        return
    print('%-14s n=%-5d min %.4f  p01 %.4f  p05 %.4f  median %.4f  mean %.4f  max %.4f'
          % (label, len(values), s['min'], s['p01'], s['p05'],
             s['median'], s['mean'], s['max']))


@torch.no_grad()
def embed(model, tok, texts, prefix, max_len, device, bs=16):
    out = []
    for i in range(0, len(texts), bs):
        enc = tok([prefix + t for t in texts[i:i + bs]], padding=True,
                  truncation=True, max_length=max_len, return_tensors='pt').to(device)
        h = model(**enc).last_hidden_state
        m = enc['attention_mask'].unsqueeze(-1).float()
        v = (h * m).sum(1) / m.sum(1).clamp(min=1e-9)
        out.append(torch.nn.functional.normalize(v, dim=-1))
    return torch.cat(out)


def top1(model, tok, rows, docs, args, device):
    """Return [(top1_cosine, top1_probability)] for rows against these docs."""
    if not rows or not docs:
        return []
    dv = embed(model, tok, [d['document'] for d in docs],
               args.passage_prefix, args.max_len, device)
    qv = embed(model, tok, [r['text'] for r in rows],
               args.query_prefix, args.max_len, device)
    sims = qv @ dv.T
    probs = torch.softmax(sims / max(args.temp, 1e-6), dim=-1)
    best = sims.max(dim=-1)
    return [(float(c), float(probs[i, j]))
            for i, (c, j) in enumerate(zip(best.values.tolist(),
                                           best.indices.tolist()))]


def reported(cos, prob, floor):
    """Exactly the rule in classifier.classify_batch."""
    return min(prob, max(cos, 0.0)) if cos < floor else prob


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dataset', help='folder holding classification_*.jsonl')
    ap.add_argument('--model-dir', default=str(ROOT / 'models' / 'classifier'))
    ap.add_argument('--template-docs', default=str(ROOT / 'models' / 'template_docs.json'))
    ap.add_argument('--max-len', type=int, default=256)
    ap.add_argument('--query-prefix', default='')
    ap.add_argument('--passage-prefix', default='')
    ap.add_argument('--temp', type=float, default=0.05,
                    help='softmax temperature; must match training (0.05)')
    ap.add_argument('--threads', type=int, default=2)
    ap.add_argument('--threshold', type=float, default=None,
                    help='auto-accept threshold; defaults to the measured value '
                         'in models/config_inference.json, else 0.80')
    ap.add_argument('--max-false-clamp', type=float, default=0.01,
                    help='budget: share of in-catalogue rows allowed to be clamped')
    ap.add_argument('--noise-file', default=None,
                    help='optional .jsonl of extra out-of-scope text (field "text")')
    ap.add_argument('--write', action='store_true',
                    help='write the chosen floor into models/config_inference.json')
    args = ap.parse_args()

    torch.set_num_threads(args.threads)
    device = 'cpu'
    cfg_path = ROOT / 'models' / 'config_inference.json'

    if args.threshold is None:
        args.threshold = 0.80
        if cfg_path.exists():
            try:
                args.threshold = float(json.loads(cfg_path.read_text(encoding='utf-8'))
                                       .get('threshold', 0.80))
            except Exception:
                pass
    print('auto-accept threshold in force: %.4f' % args.threshold)

    docs_path = Path(args.template_docs)
    if not docs_path.exists():
        alt = Path(args.model_dir) / 'template_docs.json'
        if not alt.exists():
            raise SystemExit('template_docs.json not found at %s' % args.template_docs)
        docs_path = alt
    docs = json.loads(docs_path.read_text(encoding='utf-8'))
    seen = [d for d in docs if d.get('split', 'seen') != 'unseen']
    print('catalogue: %d documents (%d after removing unseen templates)'
          % (len(docs), len(seen)))
    if len(seen) == len(docs):
        print('  NOTE: no documents are marked "unseen", so the zero-shot split is')
        print('        NOT out-of-scope here. Supply --noise-file for a real test.')

    print('loading model from %s ...' % args.model_dir)
    tok = AutoTokenizer.from_pretrained(args.model_dir)
    model = AutoModel.from_pretrained(args.model_dir).to(device).eval()

    root = Path(args.dataset)

    def gather(splits):
        rows = []
        for name, fname in splits:
            p = root / fname
            if not p.exists():
                print('skipping %s (not found)' % fname)
                continue
            data = read_jsonl(p)
            rows.extend(data)
            print('%-12s n=%d' % (name, len(data)))
        return rows

    print('\n-- in-catalogue splits (scored against the full catalogue) --')
    inside = top1(model, tok, gather(IN_CATALOGUE), docs, args, device)

    print('\n-- out-of-scope splits (scored against the catalogue minus unseen) --')
    outside_rows = gather(OUT_OF_SCOPE)
    if args.noise_file:
        extra = read_jsonl(Path(args.noise_file))
        print('%-12s n=%d' % ('noise-file', len(extra)))
        outside_rows.extend([r for r in extra if r.get('text')])
    outside = top1(model, tok, outside_rows, seen, args, device)

    if not inside:
        raise SystemExit('no in-catalogue rows found in %s' % root)

    print('\ntop-1 raw cosine distributions')
    show('in-catalogue', [c for c, _ in inside])
    show('out-of-scope', [c for c, _ in outside])

    base_leaks = sum(1 for c, p in outside if reported(c, p, 0.0) >= args.threshold)
    print('\nwith no floor at all, %d of %d out-of-scope rows are auto-accepted'
          % (base_leaks, len(outside)))
    print('These are what the floor has to catch. The threshold alone cannot,')
    print('because a sharpened softmax over bunched scores is still near 1.0.\n')

    print('%8s %14s %16s %14s' %
          ('floor', 'false clamps', 'out-of-scope caught', 'still leaking'))
    grid = [i / 100.0 for i in range(10, 91)]
    table = []
    for f in grid:
        false_clamp = sum(1 for c, _ in inside if c < f)
        caught = sum(1 for c, p in outside
                     if reported(c, p, 0.0) >= args.threshold
                     and reported(c, p, f) < args.threshold)
        leaking = base_leaks - caught
        table.append((f, false_clamp / len(inside), caught, leaking))
        if abs(f * 20 - round(f * 20)) < 1e-9:
            print('%8.2f %10d (%4.1f%%) %11d/%-4d %14d'
                  % (f, false_clamp, 100 * false_clamp / len(inside),
                     caught, base_leaks, leaking))

    budget = [r for r in table if r[1] <= args.max_false_clamp]
    if budget:
        chosen = max(budget, key=lambda r: (r[2], r[0]))
        print('\nhighest floor within a %.1f%% false-clamp budget: %.2f'
              % (100 * args.max_false_clamp, chosen[0]))
        print('  in-catalogue rows needlessly clamped: %.2f%%' % (100 * chosen[1]))
        print('  out-of-scope rows diverted to review : %d of %d'
              % (chosen[2], base_leaks))
    else:
        chosen = table[0]
        print('\nno floor stays within the %.1f%% false-clamp budget.'
              % (100 * args.max_false_clamp))
        print('Lowest available is %.2f at %.2f%% false clamps.'
              % (chosen[0], 100 * chosen[1]))

    current = 0.48
    if cfg_path.exists():
        try:
            current = float(json.loads(cfg_path.read_text(encoding='utf-8'))
                            .get('cosine_threshold', 0.48))
        except Exception:
            pass
    row = min(table, key=lambda r: abs(r[0] - current))
    print('\nthe value currently configured (%.2f) sits at %.2f%% false clamps'
          % (current, 100 * row[1]))
    print('and diverts %d of %d out-of-scope rows.' % (row[2], base_leaks))

    print('\nRead the two distributions before trusting the pick. If they overlap')
    print('heavily, no single floor separates them and the honest report says so.')

    if args.write:
        cfg = {}
        if cfg_path.exists():
            try:
                cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
            except Exception:
                cfg = {}
        cfg['cosine_threshold'] = round(float(chosen[0]), 4)
        cfg['cosine_threshold_measured_on'] = {
            'in_catalogue': [n for n, _ in IN_CATALOGUE],
            'out_of_scope': [n for n, _ in OUT_OF_SCOPE]
                            + (['noise-file'] if args.noise_file else []),
        }
        cfg['cosine_threshold_false_clamp_budget'] = args.max_false_clamp
        cfg['cosine_threshold_at_threshold'] = args.threshold
        cfg['confidence_temp'] = args.temp
        cfg_path.parent.mkdir(parents=True, exist_ok=True)
        cfg_path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n',
                            encoding='utf-8')
        print('\nwrote cosine_threshold %.2f to %s' % (chosen[0], cfg_path))
    return 0


if __name__ == '__main__':
    sys.exit(main())

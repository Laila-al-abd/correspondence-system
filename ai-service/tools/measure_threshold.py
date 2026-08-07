# -*- coding: utf-8 -*-
"""Choose the auto-accept threshold from data, not from a hunch.

The backend rule is: trusted = confidence >= threshold.
  trusted     -> CLASSIFIED, template applied, priority applied
  not trusted -> HITL,       template applied, priority ignored, staff review

So the threshold does not decide whether the template is set. It decides how
much work lands on a human reviewer, and how often that reviewer is handed a
wrong suggestion. This script sweeps it and prints both.

Standalone - torch + transformers only.

    python tools\\measure_threshold.py ..\\data-gen\\out\\dataset
    python tools\\measure_threshold.py ..\\data-gen\\out\\dataset --write
"""
import argparse
import json
import sys
from pathlib import Path

import torch
from transformers import AutoModel, AutoTokenizer

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

SPLITS = [
    ('dev', 'classification_dev.jsonl'),
    ('zero_shot', 'classification_test_zero_shot.jsonl'),
    ('style_shift', 'classification_test_style_shift.jsonl'),
]


def read_jsonl(path):
    with open(path, encoding='utf-8') as fh:
        return [json.loads(l) for l in fh if l.strip()]


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
    ap.add_argument('--target', type=float, default=0.99,
                    help='precision wanted on the auto-accepted part')
    ap.add_argument('--write', action='store_true',
                    help='write the chosen value into models/config_inference.json')
    args = ap.parse_args()

    torch.set_num_threads(args.threads)
    device = 'cpu'

    docs_path = Path(args.template_docs)
    if not docs_path.exists():
        alt = Path(args.model_dir) / 'template_docs.json'
        if alt.exists():
            docs_path = alt
        else:
            raise SystemExit('template_docs.json not found at %s' % args.template_docs)

    docs = json.loads(docs_path.read_text(encoding='utf-8'))
    codes = [d['code'] for d in docs]
    print('loaded %d template documents' % len(codes))

    print('loading model from %s ...' % args.model_dir)
    tok = AutoTokenizer.from_pretrained(args.model_dir)
    model = AutoModel.from_pretrained(args.model_dir).to(device).eval()

    dv = embed(model, tok, [d['document'] for d in docs],
               args.passage_prefix, args.max_len, device)

    root = Path(args.dataset)
    rows, conf, correct = [], [], []
    for name, fname in SPLITS:
        p = root / fname
        if not p.exists():
            print('skipping %s (not found)' % fname)
            continue
        data = read_jsonl(p)
        qv = embed(model, tok, [r['text'] for r in data],
                   args.query_prefix, args.max_len, device)
        sims = qv @ dv.T
        probs = torch.softmax(sims / args.temp, dim=-1)
        best = probs.max(dim=-1)
        for r, c, idx in zip(data, best.values.tolist(), best.indices.tolist()):
            rows.append((name, r))
            conf.append(c)
            correct.append(codes[idx] == r['template_code'])
        acc = sum(codes[i] == r['template_code']
                  for i, r in zip(best.indices.tolist(), data)) / len(data)
        print('%-12s n=%-5d top-1 accuracy %.4f' % (name, len(data), acc))

    if not rows:
        raise SystemExit('no evaluation rows found in %s' % root)

    n = len(rows)
    overall = sum(correct) / n
    print('\ncombined n=%d | top-1 accuracy %.4f' % (n, overall))
    print('\nEvery row is still given a template. The threshold only decides')
    print('CLASSIFIED vs HITL.\n')

    print('%10s %10s %12s %11s %12s' %
          ('threshold', 'auto %', 'auto acc', 'to HITL %', 'wrong autos'))
    grid = [i / 50.0 for i in range(0, 51)]
    table = []
    for t in grid:
        cov = [i for i in range(n) if conf[i] >= t]
        if cov:
            acc = sum(correct[i] for i in cov) / len(cov)
            wrong = sum(1 for i in cov if not correct[i])
        else:
            acc, wrong = float('nan'), 0
        table.append((t, len(cov) / n, acc, 1 - len(cov) / n, wrong))
        if abs(t * 10 - round(t * 10)) < 1e-9:
            print('%10.2f %9.1f%% %12.4f %10.1f%% %12d'
                  % (t, 100 * len(cov) / n, acc, 100 * (1 - len(cov) / n), wrong))

    ok = [row for row in table
          if row[1] > 0 and row[2] == row[2] and row[2] >= args.target]
    if ok:
        chosen = min(ok, key=lambda r: r[0])
        print('\nlowest threshold reaching %.1f%% precision: %.2f' % (100 * args.target, chosen[0]))
        print('  auto-classified %.1f%% of requests at %.4f accuracy'
              % (100 * chosen[1], chosen[2]))
        print('  %.1f%% (%d rows) go to a human reviewer'
              % (100 * chosen[3], round(chosen[3] * n)))
        print('  %d wrong suggestions still auto-accepted' % chosen[4])
    else:
        chosen = max(table, key=lambda r: (r[2] if r[2] == r[2] else -1))
        print('\nno threshold reaches %.1f%% precision.' % (100 * args.target))
        print('best available is %.4f at threshold %.2f' % (chosen[2], chosen[0]))

    print('\nPick deliberately. A higher threshold means fewer wrong auto-accepts')
    print('and more reviewer workload; a lower one is the reverse. You will be')
    print('asked to justify this number, so justify it with this table.')

    if args.write:
        cfg_path = ROOT / 'models' / 'config_inference.json'
        cfg = {}
        if cfg_path.exists():
            try:
                cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
            except Exception:
                cfg = {}
        cfg['threshold'] = round(float(chosen[0]), 4)
        cfg['threshold_measured_on'] = [name for name, _ in SPLITS]
        cfg['threshold_target_precision'] = args.target
        cfg['confidence_temp'] = args.temp
        cfg_path.parent.mkdir(parents=True, exist_ok=True)
        cfg_path.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n',
                            encoding='utf-8')
        print('\nwrote threshold %.2f to %s' % (chosen[0], cfg_path))
    return 0


if __name__ == '__main__':
    sys.exit(main())

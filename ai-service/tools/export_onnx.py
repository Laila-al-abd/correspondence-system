# -*- coding: utf-8 -*-
"""Export the classifier to ONNX and quantise it to int8 for CPU inference.

Why this matters on an 8 GB laptop with no GPU: the fp32 PyTorch model is
~650 MB resident, and Docker + Postgres + MinIO + Nest are already competing
for the same memory. int8 ONNX is roughly a quarter of the size and several
times faster on an i3.

int8 changes the numbers slightly. RE-RUN measure_threshold.py against the
quantised model afterwards - a threshold tuned on fp32 is not necessarily
right for int8.

    pip install "optimum[onnxruntime]"
    python tools\\export_onnx.py
"""
import argparse
import json
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model-dir', default=str(ROOT / 'models' / 'classifier'))
    ap.add_argument('--out-dir', default=str(ROOT / 'models' / 'classifier-onnx'))
    ap.add_argument('--no-quantize', action='store_true',
                    help='export fp32 ONNX only, skip int8')
    args = ap.parse_args()

    try:
        from optimum.onnxruntime import ORTModelForFeatureExtraction, ORTQuantizer
        from optimum.onnxruntime.configuration import AutoQuantizationConfig
    except ImportError:
        print('optimum is not installed:')
        print('    pip install "optimum[onnxruntime]"')
        return 1

    from transformers import AutoTokenizer

    src = Path(args.model_dir)
    out = Path(args.out_dir)
    if not (src / 'config.json').exists():
        raise SystemExit('no model at %s - is config.json directly inside it?' % src)
    out.mkdir(parents=True, exist_ok=True)

    print('exporting %s -> ONNX ...' % src)
    model = ORTModelForFeatureExtraction.from_pretrained(str(src), export=True)
    model.save_pretrained(str(out))
    AutoTokenizer.from_pretrained(str(src)).save_pretrained(str(out))

    docs = src / 'template_docs.json'
    if docs.exists():
        shutil.copy(str(docs), str(out / 'template_docs.json'))

    if args.no_quantize:
        print('done (fp32 ONNX only)')
        return 0

    print('quantising to int8 (avx2, dynamic) ...')
    quantizer = ORTQuantizer.from_pretrained(str(out))
    qconfig = AutoQuantizationConfig.avx2(is_static=False, per_channel=False)
    quantizer.quantize(save_dir=str(out), quantization_config=qconfig)

    print('\n%-42s %10s' % ('file', 'size'))
    for f in sorted(out.glob('*.onnx')):
        print('%-42s %9.1f MB' % (f.name, f.stat().st_size / 1e6))

    meta = out / 'export_info.json'
    meta.write_text(json.dumps({
        'source': str(src),
        'quantization': 'dynamic int8 (avx2, per_channel=False)',
        'note': 're-run tools/measure_threshold.py against this model; '
                'int8 shifts the confidence distribution',
    }, indent=2) + '\n', encoding='utf-8')

    print('\nNext: re-run measure_threshold.py with --model-dir %s' % out)
    print('Do not reuse the fp32 threshold without checking it.')
    return 0


if __name__ == '__main__':
    sys.exit(main())

"""Template classifier: bi-encoder nearest-document lookup.

The model never emits a template name. It embeds the request, embeds every
template document, and returns the code attached to the nearest one. Adding a
template therefore needs no retraining - only a new document.
"""
import json
import os
import time
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

import torch
import torch.nn.functional as F
from transformers import AutoModel, AutoTokenizer

from .config import Config
from .priority import suggest_priority


@dataclass
class Candidate:
    template_code: str
    template_id: Optional[str]
    score: float
    probability: float


@dataclass
class ClassifyResult:
    template_code: str
    template_id: Optional[str]
    confidence: float          # calibrated 0..1, this is what the backend sees
    cosine: float              # raw top-1 similarity, for debugging
    margin: float              # top1 - top2 cosine
    suggested_priority: str
    candidates: List[Candidate] = field(default_factory=list)
    model_version: str = ""
    elapsed_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "template_code": self.template_code,
            "template_id": self.template_id,
            "confidence": round(self.confidence, 4),
            "cosine": round(self.cosine, 4),
            "margin": round(self.margin, 4),
            "suggested_priority": self.suggested_priority,
            "candidates": [
                {"template_code": c.template_code, "template_id": c.template_id,
                 "score": round(c.score, 4), "probability": round(c.probability, 4)}
                for c in self.candidates
            ],
            "model_version": self.model_version,
            "elapsed_ms": round(self.elapsed_ms, 1),
        }


class TemplateClassifier:
    def __init__(self, cfg: Config = None):
        self.cfg = cfg or Config.load()
        torch.set_num_threads(self.cfg.torch_threads)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.tok = AutoTokenizer.from_pretrained(self.cfg.model_dir)
        self.model = AutoModel.from_pretrained(self.cfg.model_dir).to(self.device)
        self.model.eval()
        self.codes: List[str] = []
        self.doc_vecs: Optional[torch.Tensor] = None
        self.code_to_id: Dict[str, str] = {}
        self.reload_templates()

    # ---------- embedding ----------
    @torch.no_grad()
    def _embed(self, texts: List[str], prefix: str, batch: int = 8) -> torch.Tensor:
        out = []
        for i in range(0, len(texts), batch):
            chunk = [prefix + t for t in texts[i:i + batch]]
            enc = self.tok(chunk, padding=True, truncation=True,
                           max_length=self.cfg.max_len, return_tensors="pt").to(self.device)
            hidden = self.model(**enc).last_hidden_state
            mask = enc["attention_mask"].unsqueeze(-1).float()
            pooled = (hidden * mask).sum(1) / mask.sum(1).clamp(min=1e-9)
            out.append(F.normalize(pooled, dim=-1))
        return torch.cat(out)

    # ---------- templates ----------
    def reload_templates(self) -> int:
        """Disk bootstrap only - reads the seed files. Used at process start,
    before the worker has logged in, and if the backend is unreachable.
    Superseded by reload_from_backend() as soon as a sync succeeds.
    """
        with open(self.cfg.template_docs, encoding="utf-8") as fh:
            docs = json.load(fh)
        code_to_id = {}
        if os.path.exists(self.cfg.template_map):
            with open(self.cfg.template_map, encoding="utf-8") as fh:
                code_to_id = {k: v for k, v in json.load(fh).items() if v}
        return self._index(docs, code_to_id)

    def reload_from_backend(self, templates: List[Dict[str, Any]]) -> int:
        """Rebuild the index from GET /templates (active-only response expected).
        Full replace, not merge: a retired template just stops appearing next
        sync. Never touches template_docs.json/template_map.json on disk - those
        stay as the eval seed, seen/unseen split intact.
        """
        docs, code_to_id, skipped = [], {}, []
        for t in templates:
            text = t.get("classifierDocument") or t.get("descriptionAr")
            if not text:
                skipped.append(t.get("code") or t["id"])
                continue
            key = t.get("code") or t["id"]   # code is optional in the view; id never is
            docs.append({"code": key, "document": text})
            code_to_id[key] = t["id"]

        if not docs:
            # Empty/all-skipped almost certainly means something's wrong upstream,
            # not that the catalogue is genuinely empty. Keep the last good index
            # rather than embedding zero documents and breaking classify_batch's
            # matmul against doc_vecs.
            print(f"  WARNING: backend returned 0 usable templates (skipped {skipped}) - keeping {len(self.codes)} cached")
            return len(self.codes)

        if skipped:
            print(f"  WARNING: skipping templates with no classifier text: {skipped}")
        return self._index(docs, code_to_id)

    def _index(self, docs: List[Dict[str, str]], code_to_id: Dict[str, str]) -> int:
        self.codes = [d["code"] for d in docs]
        self.doc_vecs = self._embed([d["document"] for d in docs], self.cfg.passage_prefix)
        self.code_to_id = code_to_id
        return len(self.codes)

    def unmapped_codes(self) -> List[str]:
        """Template codes with no backend UUID. These can never be submitted."""
        return [c for c in self.codes if c not in self.code_to_id]

    # ---------- inference ----------
    def classify(self, text: str) -> ClassifyResult:
        return self.classify_batch([text])[0]

    def classify_batch(self, texts: List[str]) -> List[ClassifyResult]:
        t0 = time.perf_counter()
        qv = self._embed(texts, self.cfg.query_prefix)
        sims = qv @ self.doc_vecs.T
        probs = torch.softmax(sims / max(self.cfg.confidence_temp, 1e-6), dim=1)
        k = max(min(self.cfg.top_k, len(self.codes)), 2)
        top = torch.topk(sims, k=k, dim=1)
        elapsed = (time.perf_counter() - t0) * 1000 / max(len(texts), 1)

        results = []
        for row in range(len(texts)):
            idxs = top.indices[row].tolist()
            scores = top.values[row].tolist()
            cands = [
                Candidate(self.codes[i], self.code_to_id.get(self.codes[i]),
                          scores[j], float(probs[row, i]))
                for j, i in enumerate(idxs)
            ]
            # Softmax at this temperature sharpens small *relative* gaps between
            # candidates into near-certain probabilities, even when none of them is a
            # real match. cosine_threshold is the absolute floor: if the top candidate
            # doesn't clear it, the sharpened probability is lying about match quality.
            # Cap what we report at the raw similarity that actually produced it.
            if cands[0].score < self.cfg.cosine_threshold:
                for c in cands:
                    c.probability = min(c.probability, max(c.score, 0.0))
            results.append(ClassifyResult(
                template_code=cands[0].template_code,
                template_id=cands[0].template_id,
                confidence=cands[0].probability,
                cosine=cands[0].score,
                margin=scores[0] - scores[1],
                suggested_priority=suggest_priority(texts[row]),
                candidates=cands[:self.cfg.top_k],
                model_version=self.cfg.model_version,
                elapsed_ms=elapsed,
            ))
        return results

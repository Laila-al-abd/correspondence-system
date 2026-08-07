"""All tunables in one place. Secrets come from .env, never from code."""
import json
import os
from dataclasses import dataclass, asdict, field

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(HERE, ".env"))
except Exception:
    pass


def _env(key, default):
    v = os.environ.get(key)
    return v if v not in (None, "") else default


@dataclass
class Config:
    # ---- model ----
    model_dir: str = os.path.join(HERE, "models", "classifier")
    template_docs: str = os.path.join(HERE, "models", "template_docs.json")
    template_map: str = os.path.join(HERE, "models", "template_map.json")
    max_len: int = 256
    # MARBERTv2 uses no prefixes. An e5 model needs 'query: ' / 'passage: '.
    query_prefix: str = ""
    passage_prefix: str = ""
    torch_threads: int = 2          # i3-1115G4 has 2 physical cores
    model_version: str = "marbertv2-catalogue-2ep-2026-08"

    # ---- confidence ----
    # Softmax temperature applied to the cosine scores to turn them into a
    # probability. 0.05 is the training temperature, which makes the reported
    # confidence the model's own trained belief rather than a raw cosine.
    confidence_temp: float = 0.05
    # Sent as "threshold" on every classify call. The backend marks the request
    # CLASSIFIED when confidence >= threshold, HITL otherwise.
    threshold: float = 0.80
    cosine_threshold: float = 0.48
    top_k: int = 3

    # ---- backend ----
    backend_url: str = _env("BACKEND_URL", "http://localhost:3000")
    backend_email: str = _env("AI_SERVICE_EMAIL", "")
    backend_password: str = _env("AI_SERVICE_PASSWORD", "")
    page_limit: int = 100
    max_calls_per_minute: int = 45   # global throttle is 100/min; stay well under
    poll_seconds: int = 30
    template_sync_seconds: int = 600   # how often --loop repulls the catalogue
    send_priority: bool = True
    dry_run: bool = False

    @classmethod
    def load(cls, path: str = None):
        path = path or os.path.join(HERE, "config_inference.json")
        cfg = cls()
        if os.path.exists(path):
            with open(path, encoding="utf-8") as fh:
                for k, v in json.load(fh).items():
                    if hasattr(cfg, k):
                        setattr(cfg, k, v)
        return cfg

    def save(self, path: str = None):
        path = path or os.path.join(HERE, "config_inference.json")
        secret = {"backend_password", "backend_email"}
        data = {k: v for k, v in asdict(self).items() if k not in secret}
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
        return path

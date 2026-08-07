"""FastAPI wrapper. Run from ai-service/ with (venv) active:

    uvicorn main:app --reload --port 8000

The backend never calls these routes (see handoff section 0) - the worker is
what drives classification. These exist for the demo, for manual testing, and
for the day someone adds the outbound client on the NestJS side.
"""
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .backend import BackendClient
from .classifier import TemplateClassifier
from .config import Config
from .worker import run_once

app = FastAPI(title="ICS AI Service", version="1.0.0")
_clf: Optional[TemplateClassifier] = None
_cfg: Optional[Config] = None


def clf() -> TemplateClassifier:
    global _clf, _cfg
    if _clf is None:
        _cfg = Config.load()
        _clf = TemplateClassifier(_cfg)
    return _clf


class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)


class ClassifyBatchRequest(BaseModel):
    texts: List[str]


class RunOnceRequest(BaseModel):
    limit: Optional[int] = None
    dry_run: bool = False


@app.on_event("startup")
def _warm():
    c = clf()
    c.classify("\u062a\u0647\u064a\u0626\u0629")   # warm the graph
    missing = c.unmapped_codes()
    print(f"ready: {len(c.codes)} templates on {c.device}")
    if missing:
        print(f"WARNING: unmapped template codes {missing}")


@app.get("/health")
def health():
    c = clf()
    return {
        "status": "ok",
        "device": c.device,
        "templates": len(c.codes),
        "unmapped": c.unmapped_codes(),
        "model_version": c.cfg.model_version,
        "threshold": c.cfg.threshold,
    }


@app.post("/classify")
def classify(req: ClassifyRequest):
    if not req.text.strip():
        raise HTTPException(status_code=422, detail="empty text")
    return clf().classify(req.text).to_dict()


@app.post("/classify-batch")
def classify_batch(req: ClassifyBatchRequest):
    if not req.texts:
        raise HTTPException(status_code=422, detail="empty batch")
    return {"results": [r.to_dict() for r in clf().classify_batch(req.texts)]}


'''@app.post("/reload-templates")
def reload_templates():
    c = clf()
    n = c.reload_templates()
    return {"status": "ok", "templates": n, "unmapped": c.unmapped_codes()}
'''
@app.post("/reload-templates")
def reload_templates(from_backend: bool = False):
    c = clf()
    if from_backend:
        cfg = Config.load()
        if not cfg.backend_email or not cfg.backend_password:
            raise HTTPException(status_code=503, detail="backend credentials not configured")
        client = BackendClient(cfg)
        try:
            client.login()
            n = c.reload_from_backend(client.list_templates())
        finally:
            client.close()
    else:
        n = c.reload_templates()
    return {"status": "ok", "templates": n, "unmapped": c.unmapped_codes()}

@app.post("/run-once")
def trigger_pass(req: RunOnceRequest):
    """Trigger one worker pass over the queue. Handy for the live demo."""
    c = clf()
    cfg = Config.load()
    cfg.dry_run = req.dry_run
    if not cfg.backend_email or not cfg.backend_password:
        raise HTTPException(status_code=503, detail="backend credentials not configured")
    client = BackendClient(cfg)
    try:
        client.login()
        return run_once(c, client, cfg, limit=req.limit, verbose=False)
    finally:
        client.close()

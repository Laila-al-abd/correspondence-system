"""The pull loop.

The backend never calls us (handoff section 0), so we go looking for work:

    page /requests/queue?status=DRAFT  ->  keep classificationStatus == PENDING
    GET /requests/:id                  ->  rawText
    model                              ->  top-3 template codes
    POST /requests/:id/classify/model  ->  CLASSIFIED or HITL

If the backend rejects our first choice on eligibility or form-validity grounds
we fall back to the second, then the third. That is exactly why the classifier
returns a ranked list rather than one answer.

Run a single pass:      python -m ics_ai.worker --once
Run continuously:       python -m ics_ai.worker --loop
Change nothing at all:  python -m ics_ai.worker --once --dry-run
"""
import argparse
import time
from collections import Counter
from typing import Any, Dict, Optional

from .backend import BackendClient, BackendError
from .classifier import TemplateClassifier
from .config import Config

# The backend told us our template choice was wrong. Try the next candidate.
TRY_NEXT = {"filled_data_invalid", "not_eligible"}
# Nothing we can do for this request.
GIVE_UP = {"not_found", "not_draft", "bad_request", "forbidden"}


def process_one(clf: TemplateClassifier, client: BackendClient,
                cfg: Config, request_id: str, stats: Counter) -> Optional[Dict[str, Any]]:
    detail = client.get_request(request_id)
    if detail is None:
        stats["detail_404"] += 1
        return None
    if detail.get("classificationStatus") != "PENDING":
        stats["skipped_not_pending"] += 1
        return None

    text = (detail.get("rawText") or "").strip()
    if not text:
        # No free text means nothing to classify. A human must handle it.
        stats["skipped_no_text"] += 1
        return None

    result = clf.classify(text)

    for rank, cand in enumerate(result.candidates, start=1):
        if not cand.template_id:
            stats[f"unmapped_code:{cand.template_code}"] += 1
            continue
        outcome = client.classify_by_model(
            request_id=request_id,
            template_id=cand.template_id,
            confidence=cand.probability,
            threshold=cfg.threshold,
            model_version=cfg.model_version,
            suggested_priority=result.suggested_priority if cfg.send_priority else None,
        )
        if outcome.ok:
            stats[f"sent_rank{rank}"] += 1
            stats[outcome.classification_status or outcome.kind] += 1
            return {
                "requestId": request_id,
                "rank": rank,
                "templateCode": cand.template_code,
                "confidence": round(cand.probability, 4),
                "classificationStatus": outcome.classification_status,
            }
        if outcome.kind in TRY_NEXT:
            stats[f"rejected_rank{rank}:{outcome.kind}"] += 1
            continue
        stats[f"failed:{outcome.kind}"] += 1
        if outcome.kind in GIVE_UP:
            return None
        return None

    stats["exhausted_all_candidates"] += 1
    return None

def sync_templates(clf: TemplateClassifier, client: BackendClient, verbose: bool = True) -> bool:
    """Pull the active template catalogue and re-embed. Failure is not
    fatal - keep classifying against whatever was loaded last rather than
    crash the worker over a transient network blip."""
    try:
        n = clf.reload_from_backend(client.list_templates())
        if verbose:
            print(f"  synced {n} templates from backend")
        missing = clf.unmapped_codes()
        if missing:
            print(f"  WARNING: no backend UUID for {missing}")
        return True
    except BackendError as e:
        if verbose:
            print(f"  template sync failed ({e.kind}), keeping {len(clf.codes)} cached templates")
        return False

def run_once(clf: TemplateClassifier, client: BackendClient, cfg: Config,
             limit: Optional[int] = None, verbose: bool = True) -> Dict[str, Any]:
    stats = Counter()
    handled = []
    t0 = time.time()
    try:
        for summary in client.iter_draft_requests():
            stats["seen"] += 1
            # The summary view carries no text, but it does carry the status,
            # so we can skip most rows without paying for a detail call.
            if summary.get("classificationStatus") not in (None, "PENDING"):
                continue
            out = process_one(clf, client, cfg, summary["id"], stats)
            if out:
                handled.append(out)
                if verbose:
                    print(f"  {out['requestId'][:8]}  {out['templateCode']:<18} "
                          f"conf={out['confidence']:.3f}  -> {out['classificationStatus']} "
                          f"(rank {out['rank']})")
            if limit and len(handled) >= limit:
                break
    except BackendError as e:
        stats[f"aborted:{e.kind}"] += 1
        if verbose:
            print(f"  aborted: {e}")

    return {
        "classified": len(handled),
        "elapsed_s": round(time.time() - t0, 1),
        "stats": dict(stats),
        "items": handled,
    }


def main():
    ap = argparse.ArgumentParser(description="ICS classification worker")
    ap.add_argument("--once", action="store_true", help="one pass, then exit")
    ap.add_argument("--loop", action="store_true", help="poll forever")
    ap.add_argument("--limit", type=int, default=None, help="stop after N requests")
    ap.add_argument("--dry-run", action="store_true", help="read and predict, never POST")
    args = ap.parse_args()

    cfg = Config.load()
    if args.dry_run:
        cfg.dry_run = True
    if not cfg.backend_email or not cfg.backend_password:
        raise SystemExit("Set AI_SERVICE_EMAIL and AI_SERVICE_PASSWORD in ai-service/.env")

    clf = TemplateClassifier(cfg)
    
    client = BackendClient(cfg)
    client.login()
    sync_templates(clf, client)     # REPLACES the old "missing = clf.unmapped_codes()" block -
                                 # that warning now lives inside sync_templates, on fresh data
    print(f"logged in to {cfg.backend_url} | {len(clf.codes)} templates | "
        f"threshold {cfg.threshold} | dry_run {cfg.dry_run}")

    try:
        if args.loop:
            last_sync = time.monotonic()
            while True:
                if time.monotonic() - last_sync >= cfg.template_sync_seconds:
                    sync_templates(clf, client)
                    last_sync = time.monotonic()
                print(f"--- pass at {time.strftime('%H:%M:%S')}")
                print(run_once(clf, client, cfg, args.limit)["stats"])
                time.sleep(cfg.poll_seconds)
        else:
            out = run_once(clf, client, cfg, args.limit)
            print(f"\nclassified {out['classified']} in {out['elapsed_s']}s")
            for k, v in sorted(out["stats"].items()):
                print(f"  {k:<34} {v}")
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        client.close()


if __name__ == "__main__":
    main()

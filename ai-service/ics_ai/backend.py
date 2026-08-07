"""HTTP client for the NestJS backend.

Everything the handoff warns about is handled here so the worker stays readable:
login once and reuse the token, stay under the throttle, back off on 429,
retry once on 409, and translate the documented error bodies into flags the
worker can branch on.
"""
import time
from dataclasses import dataclass
from typing import Any, Dict, Iterator, List, Optional

import httpx

from .config import Config


class BackendError(Exception):
    def __init__(self, status: int, body: Any, kind: str = "unknown"):
        super().__init__(f"{status} {kind}: {body}")
        self.status = status
        self.body = body
        self.kind = kind


def _classify_error(status: int, body: Any) -> str:
    """Map a backend failure onto the cases in section 2 of the handoff."""
    text = str(body)
    if status == 404:
        return "not_found"
    if status == 409:
        return "conflict"
    if status == 429:
        return "rate_limited"
    if status == 401:
        return "unauthorized"
    if status == 400:
        if "FilledDataInvalid" in text:
            return "filled_data_invalid"      # wrong template -> try next choice
        if "Only draft" in text or "InvariantViolation" in text:
            return "not_draft"                # already moved on -> skip
        if "INVALID_CURSOR" in text:
            return "invalid_cursor"
        return "bad_request"
    if status == 403:
        if "NotEligible" in text:
            return "not_eligible"             # wrong template -> try next choice
        return "forbidden"                    # most likely STAFF_IP_ALLOWLIST
    return "unknown"


@dataclass
class ClassifyOutcome:
    ok: bool
    kind: str = "ok"
    classification_status: Optional[str] = None
    detail: Any = None


class BackendClient:
    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.base = cfg.backend_url.rstrip("/")
        self.http = httpx.Client(base_url=self.base, timeout=30.0)
        self.token: Optional[str] = None
        self._min_gap = 60.0 / max(cfg.max_calls_per_minute, 1)
        self._last_call = 0.0

    # ---------- plumbing ----------
    def _pace(self):
        """Stay under the 100/min global throttle without thinking about it."""
        wait = self._min_gap - (time.monotonic() - self._last_call)
        if wait > 0:
            time.sleep(wait)
        self._last_call = time.monotonic()

    def login(self) -> str:
        """Log in ONCE. /auth/login is throttled at 5/min - never call per request."""
        self._pace()
        r = self.http.post("/auth/login", json={
            "email": self.cfg.backend_email,
            "password": self.cfg.backend_password,
        })
        if r.status_code >= 400:
            raise BackendError(r.status_code, r.text, _classify_error(r.status_code, r.text))
        data = r.json()
        self.token = (data.get("accessToken") or data.get("access_token")
                      or data.get("token") or (data.get("data") or {}).get("accessToken"))
        if not self.token:
            raise BackendError(200, data, "no_token_in_login_response")
        return self.token

    def _request(self, method: str, path: str, *, retry_auth=True,
                 retry_conflict=True, **kw) -> httpx.Response:
        if self.token is None:
            self.login()
        headers = kw.pop("headers", {})
        headers["Authorization"] = f"Bearer {self.token}"
        self._pace()
        r = self.http.request(method, path, headers=headers, **kw)

        if r.status_code == 401 and retry_auth:
            self.login()
            return self._request(method, path, retry_auth=False,
                                 retry_conflict=retry_conflict, **kw)
        if r.status_code == 429:
            back = float(r.headers.get("retry-after", 5))
            time.sleep(min(max(back, 1.0), 60.0))
            return self._request(method, path, retry_auth=False,
                                 retry_conflict=retry_conflict, **kw)
        if r.status_code == 409 and retry_conflict:
            time.sleep(0.5)
            return self._request(method, path, retry_auth=retry_auth,
                                 retry_conflict=False, **kw)
        return r

    # ---------- reads ----------
    def iter_draft_requests(self, max_pages: int = 50) -> Iterator[Dict[str, Any]]:
        """Page the queue. Ordering is stable, so this will not skip rows."""
        cursor = None
        for _ in range(max_pages):
            params = {"status": "DRAFT", "classificationStatus": "PENDING",
                      "limit": self.cfg.page_limit}
            if cursor:
                params["cursor"] = cursor
            r = self._request("GET", "/requests/queue", params=params)
            if r.status_code >= 400:
                raise BackendError(r.status_code, r.text,
                                   _classify_error(r.status_code, r.text))
            page = r.json()
            for item in page.get("items", []):
                yield item
            cursor = page.get("nextCursor")
            if not cursor:
                return

    def get_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        r = self._request("GET", f"/requests/{request_id}")
        if r.status_code == 404:
            return None
        if r.status_code >= 400:
            raise BackendError(r.status_code, r.text,
                               _classify_error(r.status_code, r.text))
        return r.json()

    def list_templates(self, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """GET /templates. Active-only by default - same default the endpoint
        itself uses, and exactly what the classifier must never embed against."""
        params = {"includeInactive": "true"} if include_inactive else {}
        r = self._request("GET", "/templates", params=params)
        if r.status_code >= 400:
            raise BackendError(r.status_code, r.text, _classify_error(r.status_code, r.text))
        return r.json()

    # ---------- write ----------
    def classify_by_model(self, request_id: str, template_id: str, confidence: float,
                          threshold: float, model_version: str,
                          suggested_priority: Optional[str] = None) -> ClassifyOutcome:
        body = {
            "templateId": template_id,
            "confidence": round(float(max(0.0, min(1.0, confidence))), 6),
            "threshold": round(float(threshold), 6),
            "modelVersion": model_version,
        }
        if suggested_priority:
            body["suggestedPriority"] = suggested_priority

        if self.cfg.dry_run:
            return ClassifyOutcome(True, "dry_run", None, body)

        r = self._request("POST", f"/requests/{request_id}/classify/model", json=body)
        if r.status_code < 400:
            data = r.json()
            return ClassifyOutcome(True, "ok", data.get("classificationStatus"), data)
        return ClassifyOutcome(False, _classify_error(r.status_code, r.text),
                               None, r.text)

    def close(self):
        self.http.close()

"""Entry point so the documented command works unchanged:

    uvicorn main:app --reload --port 8000
"""
from ics_ai.app import app

__all__ = ["app"]

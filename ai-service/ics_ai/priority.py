"""Suggested priority. This is a RULE, not a model - say so when asked.

The backend treats suggestedPriority as a one-time hint and ignores it entirely
when the request goes to HITL, so a wrong guess is cheap. A learned priority
model would need labelled priorities, which the dataset does not have.
"""
import re

URGENT = [
    "\u0636\u064a\u0642 \u0627\u0644\u0645\u0647\u0644\u0629",   # deadline pressure
    "\u0639\u0627\u062c\u0644",                                     # urgent
    "\u0645\u0633\u062a\u0639\u062c\u0644",                         # in a hurry
]
HIGH = [
    "\u0628\u0623\u0633\u0631\u0639 \u0648\u0642\u062a",           # as soon as possible
    "\u0628\u0623\u0642\u0631\u0628 \u0648\u0642\u062a",
    "\u0641\u064a \u0623\u0642\u0631\u0628 \u0648\u0642\u062a",
    "\u0628\u0633\u0631\u0639\u0629",                               # quickly
    "\u0636\u0631\u0648\u0631\u064a",                               # necessary
]


def suggest_priority(text: str) -> str:
    t = re.sub(r"\s+", " ", text or "")
    for kw in URGENT:
        if kw in t:
            return "URGENT"
    for kw in HIGH:
        if kw in t:
            return "HIGH"
    return "NORMAL"

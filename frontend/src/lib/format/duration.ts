// src/lib/format/duration.ts
//
// Wording for the two timing figures a requester sees.
//
// Both existed already and neither was readable. `slaDueAt` was labelled
// "SLA Due", which reads as a deadline for the whole request when it is in
// fact the deadline of the step being worked right now (the backend takes the
// minimum slaDueAt over the open, unpaused steps). And `durationEstimate` --
// the median-or-declared figure GetRequestHandler has always computed and
// shipped -- was declared in the types and rendered by nothing.

import { DurationEstimateView } from '@/types/request';

// The seeded working_hours policy is 08:00-15:30 over five days, so a working
// day is 7.5 hours. Used only to add a friendlier "about N working days"
// alongside the hours; the authoritative unit is always working minutes.
const WORKING_HOURS_PER_DAY = 7.5;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Working minutes as a phrase, e.g. "12 working hours (about 1.6 working days)". */
export function formatWorkingMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes} minutes of working time`;
  const hours = round1(minutes / 60);
  if (hours < WORKING_HOURS_PER_DAY) return `${hours} working hours`;
  const days = round1(hours / WORKING_HOURS_PER_DAY);
  return `${hours} working hours (about ${days} working days)`;
}

/**
 * Says where the figure came from, because the two bases answer different
 * questions and must not be worded the same way: OBSERVED is "requests like
 * this usually take", DECLARED is "this is allowed to take".
 */
export function describeEstimateBasis(estimate: DurationEstimateView): string {
  if (estimate.basis === 'OBSERVED')
    return `Median of ${estimate.sampleSize} completed requests of this type.`;
  return 'No completed history yet — this is the time the workflow is allowed to take.';
}

/** ON_TRACK -> "On track". */
export function formatSlaRisk(risk?: string): string {
  if (!risk) return '—';
  const words = risk.toLowerCase().split('_');
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ');
}

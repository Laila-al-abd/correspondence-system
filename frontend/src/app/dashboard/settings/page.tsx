'use client';
// src/app/dashboard/settings/page.tsx
//
// System settings. Two documents, each saved whole:
//   working_hours     -- the schedule SLA dates and the working-hours guard use
//   request_numbering -- the shape of human-readable reference numbers
//
// Both were administrable data in the database from the start, and until now the
// only way to change either was to write the row by hand. This screen is the
// missing half of that feature, not a new one.
//
// Guarded on `system.monitor` to match the controller. That permission is
// deliberately absent from the backend's TIME_RESTRICTED_PERMISSIONS, so an
// administrator whose working-hours policy is wrong can still repair it outside
// working hours -- gating this screen on a time-boxed permission would have been
// able to lock the settings away until morning.

import { useEffect, useState } from 'react';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSetting, useUpdateSetting } from '@/lib/hooks/use-settings';
import {
  DEFAULT_NUMBERING,
  DEFAULT_WORKING_HOURS,
  NumberingResetPolicy,
  NumberingScheme,
  REQUEST_NUMBERING_KEY,
  WEEKDAY_LABELS,
  WORKING_HOURS_KEY,
  WorkingHoursPolicy,
  asNumberingScheme,
  asWorkingHours,
  previewReferenceNumber,
} from '@/types/settings';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring';

/** Turns an ApiError (or anything else) into one line a human can act on. */
function messageOf(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}

/** "Configured" vs "running on defaults" -- the distinction the API reports. */
function ConfiguredBadge({
  configured,
  updatedAt,
}: {
  configured: boolean;
  updatedAt?: string;
}) {
  if (!configured)
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Default (never saved)
      </Badge>
    );
  return (
    <Badge variant="secondary">
      Saved{updatedAt ? ` · ${new Date(updatedAt).toLocaleString()}` : ''}
    </Badge>
  );
}

function WorkingHoursCard() {
  const { data, isLoading, error } = useSetting(WORKING_HOURS_KEY);
  const update = useUpdateSetting();

  const [form, setForm] = useState<WorkingHoursPolicy>(DEFAULT_WORKING_HOURS);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // The server's value is the source of truth for the form's initial state, and
  // it arrives after the first render. Re-seeding on every response also means a
  // rejected save leaves the boxes as the operator typed them, because a failed
  // mutation does not change `data`.
  useEffect(() => {
    if (data) setForm(asWorkingHours(data.value));
  }, [data]);

  function toggleDay(day: number) {
    setForm((prev) => {
      const has = prev.days.includes(day);
      const days = has
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort((a, b) => a - b);
      return { ...prev, days };
    });
  }

  async function handleSave() {
    setSaveError(null);
    setSaved(false);
    try {
      await update.mutateAsync({ key: WORKING_HOURS_KEY, value: form });
      setSaved(true);
    } catch (err) {
      // The server validates this document as a whole (start before end, real
      // IANA zone, no repeated weekday) and its message names the field, so it
      // is shown verbatim rather than replaced with something vaguer.
      setSaveError(
        messageOf(err, 'Could not save the working hours. Check the values.'),
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Working hours</CardTitle>
            <CardDescription>
              Used for SLA due dates, recorded step durations, and the guard that
              limits when staff may act on requests.
            </CardDescription>
          </div>
          {data && (
            <ConfiguredBadge
              configured={data.configured}
              updatedAt={data.updatedAt}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {messageOf(error, 'Could not load the working hours.')}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="wh-enabled"
            checked={form.enabled}
            onCheckedChange={(checked) =>
              setForm((prev) => ({ ...prev, enabled: checked === true }))
            }
          />
          <Label htmlFor="wh-enabled">Enforce working hours</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          When off, staff may act at any hour and SLA clocks run continuously.
        </p>

        <div className="space-y-2">
          <Label>Working days</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {WEEKDAY_LABELS.map((label, day) => (
              <div key={label} className="flex items-center gap-2">
                <Checkbox
                  id={`wh-day-${day}`}
                  checked={form.days.includes(day)}
                  onCheckedChange={() => toggleDay(day)}
                />
                <Label htmlFor={`wh-day-${day}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </div>
          {form.days.length === 0 && (
            <p className="text-xs text-destructive">
              Choose at least one working day.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="wh-start">Start</Label>
            <Input
              id="wh-start"
              type="time"
              value={form.start}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, start: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wh-end">End</Label>
            <Input
              id="wh-end"
              type="time"
              value={form.end}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="wh-tz">Timezone</Label>
            <Input
              id="wh-tz"
              value={form.timezone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, timezone: e.target.value }))
              }
              placeholder="Asia/Damascus"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          An IANA zone name. The institute&apos;s own clock, not the browser&apos;s.
        </p>

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {saved && !saveError && (
          <p className="text-sm text-muted-foreground">
            Saved. New SLA due dates use these hours immediately; dates already
            calculated are not recomputed.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={update.isPending || form.days.length === 0}
          >
            {update.isPending ? 'Saving…' : 'Save working hours'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(
                data ? asWorkingHours(data.value) : DEFAULT_WORKING_HOURS,
              );
              setSaveError(null);
              setSaved(false);
            }}
            disabled={update.isPending}
          >
            Reset form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NumberingCard() {
  const { data, isLoading, error } = useSetting(REQUEST_NUMBERING_KEY);
  const update = useUpdateSetting();

  const [form, setForm] = useState<NumberingScheme>(DEFAULT_NUMBERING);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(asNumberingScheme(data.value));
  }, [data]);

  async function handleSave() {
    setSaveError(null);
    setSaved(false);
    try {
      await update.mutateAsync({ key: REQUEST_NUMBERING_KEY, value: form });
      setSaved(true);
    } catch (err) {
      setSaveError(
        messageOf(err, 'Could not save the numbering scheme. Check the pattern.'),
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Request numbering</CardTitle>
            <CardDescription>
              The reference number stamped on a request when it is submitted.
            </CardDescription>
          </div>
          {data && (
            <ConfiguredBadge
              configured={data.configured}
              updatedAt={data.updatedAt}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            {messageOf(error, 'Could not load the numbering scheme.')}
          </p>
        )}

        <div className="space-y-1">
          <Label htmlFor="num-pattern">Pattern</Label>
          <Input
            id="num-pattern"
            value={form.pattern}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, pattern: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Available tokens: <code>{'{prefix}'}</code>, <code>{'{year}'}</code>,{' '}
            <code>{'{month}'}</code>, <code>{'{seq}'}</code>. The pattern must
            contain <code>{'{seq}'}</code> or two requests could share a number.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="num-prefix">Prefix</Label>
            <Input
              id="num-prefix"
              value={form.prefix}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, prefix: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="num-padding">Sequence digits</Label>
            <Input
              id="num-padding"
              type="number"
              min={0}
              max={12}
              value={form.seqPadding}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  seqPadding: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="num-reset">Sequence resets</Label>
            <select
              id="num-reset"
              className={selectClass}
              value={form.resetPolicy}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  resetPolicy: e.target.value as NumberingResetPolicy,
                }))
              }
            >
              <option value="YEARLY">Every year</option>
              <option value="MONTHLY">Every month</option>
              <option value="NEVER">Never</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="num-year">Year digits</Label>
            <select
              id="num-year"
              className={selectClass}
              value={String(form.yearDigits)}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  yearDigits: Number(e.target.value),
                }))
              }
            >
              <option value="4">Four (2026)</option>
              <option value="2">Two (26)</option>
            </select>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <p className="text-xs text-muted-foreground">Next number will look like</p>
          <p className="font-mono text-sm">{previewReferenceNumber(form)}</p>
        </div>

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        {saved && !saveError && (
          <p className="text-sm text-muted-foreground">
            Saved. Requests already submitted keep the numbers they were given.
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save numbering'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(data ? asNumberingScheme(data.value) : DEFAULT_NUMBERING);
              setSaveError(null);
              setSaved(false);
            }}
            disabled={update.isPending}
          >
            Reset form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <PermissionGate require="system.monitor">
      <div className="space-y-6 p-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--ics-primary)' }}
          >
            System settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Operational configuration. Each setting is saved as one document and
            validated by the server before it takes effect.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <WorkingHoursCard />
          <NumberingCard />
        </div>
      </div>
    </PermissionGate>
  );
}

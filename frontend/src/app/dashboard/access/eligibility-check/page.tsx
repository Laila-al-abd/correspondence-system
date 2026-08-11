'use client';
// src/app/dashboard/access/eligibility-check/page.tsx
//
// Diagnostic tool, distinct from RBAC permissions (GET /auth/me/permissions,
// already surfaced via usePermissions()). This answers a different question:
// given a user's ABAC attributes, which templates can they submit, and for
// one specific template, which rule(s) are they failing.

import { useState } from 'react';
import { useUsers } from '@/lib/hooks/use-users';
import { useTemplates } from '@/lib/hooks/use-template';
import { useEligibleTemplates, useTemplateEligibility } from '@/lib/hooks/use-access';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { UserSummaryView } from '@/types/identity';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

function formatRuleValue(value: unknown): string {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }
  return String(value);
}

function EligibilityCheckContent() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [selectedUser, setSelectedUser] = useState<UserSummaryView | null>(null);
  const [checkTemplateId, setCheckTemplateId] = useState('');

  const { data: userResults, isLoading: searching } = useUsers(1, 10, searchTerm);
  const { data: eligibleTemplates, isLoading: loadingEligible } = useEligibleTemplates(selectedUser?.id ?? '');
  const { data: templates } = useTemplates();
  const { data: eligibilityCheck, isLoading: checkingOne } = useTemplateEligibility(
    selectedUser?.id ?? '',
    checkTemplateId
  );

  function handleSearch() {
    setSearchTerm(searchInput.trim() || undefined);
  }

  function selectUser(user: UserSummaryView) {
    setSelectedUser(user);
    setCheckTemplateId('');
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Check User Eligibility</h1>
        <p className="text-sm text-muted-foreground">
          See which templates a user is eligible to submit, based on ABAC attribute rules.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader><CardTitle>Find a user</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search by name or email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>Search</Button>
          </div>

          {userResults && userResults.items.length > 0 && (
            <div className="divide-y rounded-md border">
              {userResults.items.map((u) => (
                <button
                  key={u.id}
                  onClick={() => selectUser(u)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50 ${
                    selectedUser?.id === u.id ? 'bg-muted' : ''
                  }`}
                >
                  <span>{u.fullNameAr}{u.fullNameEn && ` (${u.fullNameEn})`}</span>
                  <span className="text-muted-foreground">{u.email}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <div className="space-y-6">
          <p className="text-sm">
            Showing eligibility for <strong>{selectedUser.fullNameAr}</strong> ({selectedUser.email})
          </p>

          <div className="space-y-2">
            <h2 className="font-medium">Eligible templates</h2>
            {loadingEligible ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : !eligibleTemplates || eligibleTemplates.length === 0 ? (
              <p className="text-muted-foreground text-sm">This user is not eligible for any active template.</p>
            ) : (
              <ul className="space-y-1">
                {eligibleTemplates.map((t) => (
                  <li key={t.id}>
                    <Badge variant="default">{t.title.ar}{t.title.en && ` (${t.title.en})`}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkTemplate">Check a specific template</Label>
            <select
              id="checkTemplate"
              className={selectClass}
              value={checkTemplateId}
              onChange={(e) => setCheckTemplateId(e.target.value)}
            >
              <option value="">— select template —</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>{t.nameAr}{t.nameEn && ` (${t.nameEn})`}</option>
              ))}
            </select>

            {checkTemplateId && (
              checkingOne ? (
                <p className="text-muted-foreground text-sm">Checking…</p>
              ) : eligibilityCheck && (
                <div className="space-y-2 pt-2">
                  <Badge variant={eligibilityCheck.eligible ? 'default' : 'secondary'}>
                    {eligibilityCheck.eligible ? 'Eligible' : 'Not eligible'}
                  </Badge>
                  {!eligibilityCheck.eligible && eligibilityCheck.unmetRules.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attribute</TableHead>
                          <TableHead>Operator</TableHead>
                          <TableHead>Required value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eligibilityCheck.unmetRules.map((rule, i) => (
                          <TableRow key={i}>
                            <TableCell>{rule.attributeCode ?? rule.attributeId}</TableCell>
                            <TableCell>{rule.operator}</TableCell>
                            <TableCell className="font-mono text-xs">{formatRuleValue(rule.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EligibilityCheckPage() {
  return (
    <PermissionGate require="template.manage">
      <EligibilityCheckContent />
    </PermissionGate>
  );
}
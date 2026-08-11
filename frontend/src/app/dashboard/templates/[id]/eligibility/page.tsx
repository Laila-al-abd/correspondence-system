'use client';
// src/app/dashboard/templates/[id]/eligibility/page.tsx
import { useParams, useRouter } from 'next/navigation';
import { useTemplate } from '@/lib/hooks/use-template';
import { useEligibilityRules } from '@/lib/hooks/use-access';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EligibilityRuleForm } from '@/components/forms/eligibility-rule-form';
import { EligibilityRuleDeleteButton } from '@/components/forms/eligibility-rule-delete-button';

const OPERATOR_LABELS: Record<string, string> = {
  EQ: 'equals',
  NEQ: 'not equals',
  IN: 'in',
  GTE: '≥',
  LTE: '≤',
};

function formatRuleValue(value: unknown): string {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value);
  }
  return String(value);
}

function EligibilityRulesContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const templateId = params.id;

  const { data: template, isLoading: templateLoading } = useTemplate(templateId);
  const { data: rules, isLoading: rulesLoading } = useEligibilityRules(templateId);

  if (templateLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!template) return <p className="p-6 text-destructive">Template not found.</p>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Eligibility Rules</h1>
        <p className="text-sm text-muted-foreground">
          {template.nameAr}{template.nameEn && ` (${template.nameEn})`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          A user must satisfy every rule below to be eligible to submit this template.
        </p>
      </div>

      {rulesLoading ? (
        <p className="text-muted-foreground">Loading rules…</p>
      ) : !rules || rules.length === 0 ? (
        <p className="text-muted-foreground">No eligibility rules defined yet — every user can submit this template.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attribute</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  {rule.attributeCode ?? (
                    <span className="italic text-muted-foreground">attribute removed</span>
                  )}
                </TableCell>
                <TableCell>{OPERATOR_LABELS[rule.operator] ?? rule.operator}</TableCell>
                <TableCell className="font-mono text-xs">{formatRuleValue(rule.value)}</TableCell>
                <TableCell className="text-right">
                  <EligibilityRuleDeleteButton templateId={templateId} ruleId={rule.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <EligibilityRuleForm templateId={templateId} />

      <Button variant="outline" onClick={() => router.push('/dashboard/templates')}>
        Cancel
      </Button>
    </div>
  );
}

export default function EligibilityRulesPage() {
  return (
    <PermissionGate require="template.manage">
      <EligibilityRulesContent />
    </PermissionGate>
  );
}
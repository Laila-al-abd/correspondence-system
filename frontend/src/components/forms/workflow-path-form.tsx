'use client';
// src/components/forms/workflow-path-form.tsx
//
// Form for defining a new workflow path for a template.
// POST /workflow-paths
//
// Notes:
// - templateId: locked to the route's template when the `templateId` prop is
//   passed (the normal case — this form is only reached from
//   /dashboard/templates/[id]/workflow-paths/new). Falls back to an editable
//   dropdown if the prop is omitted, so the form still works standalone.
// - name is required (LocalizedTextDto: ar 1-255, en optional 1-255).
// - description is optional (same structure).
// - steps is a required non-empty array of WorkflowStepDto.
// - activate is optional boolean (default false).
// - No update route exists (no PATCH /workflow-paths/:id) → create-only form.
// - Requires 'workflow.manage' permission.
// - Complex form with dynamic step array. Each step has:
//   - key (required, 1-100 chars, used for dependsOn references)
//   - name (required, LocalizedTextDto)
//   - description (optional, LocalizedTextDto)
//   - assigneeType (required, enum AssigneeType)
//   - assigneeRoleId (optional, UUID) — Case (a): GET /roles — required when assigneeType=SPECIFIC_ROLE
//   - assigneeDepartmentId (optional, UUID) — Case (a): GET /organization/departments/tree — required when assigneeType=SPECIFIC_UNIT
//   - defaultActionTypeId (optional, string) — dropdown from GET /action-types (all action types)
//   - slaHours (optional, int >= 1)
//   - pausesSla (optional, boolean)
//   - feeAmount (optional, > 0) / feeCurrency (optional, 3-letter ISO, default SYP)
//     The fee is charged when the step is STARTED and the step cannot be
//     completed until that payment is confirmed or waived.
//   - allowedActionTypeIds (optional, string[]) — multi-select from GET /action-types?onlyTerminal=true (terminal action types only)
//   - dependsOn (optional, string[]) — references other step keys

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDefineWorkflowPath } from '@/lib/hooks/use-workflow';
import { useTemplates as useTemplateHook } from '@/lib/hooks/use-template';
import { useRoles } from '@/lib/hooks/use-roles';
import { useDepartmentTree } from '@/lib/hooks/use-organization';
import { useActionTypes } from '@/lib/hooks/use-action-type';
import {
  DefineWorkflowPathDto,
  WorkflowStepDto,
  LocalizedTextDto,
  AssigneeType
} from '@/types/workflow';
import { defineWorkflowPathSchema } from '@/lib/validations/workflow-path.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

interface Props {
  /**
   * Template this path belongs to. Pass this when the form is reached from a
   * specific template's page (the normal case) — the template selector is
   * replaced with a read-only display instead of an editable dropdown, since
   * the template is already fixed by the route.
   */
  templateId?: string;
  /** Optional existing workflow path to edit — not used (no update route). */
  existing?: never;
}

const ASSIGNEE_TYPE_LABELS: Record<AssigneeType, string> = {
  [AssigneeType.SPECIFIC_UNIT]: 'Specific Unit (SPECIFIC_UNIT)',
  [AssigneeType.SPECIFIC_ROLE]: 'Specific Role (SPECIFIC_ROLE)',
  [AssigneeType.REQUESTER_DEPARTMENT_HEAD]: "Requester's Department Head (REQUESTER_DEPARTMENT_HEAD)",
  [AssigneeType.REQUESTER_FACULTY_DEAN]: "Requester's Faculty Dean (REQUESTER_FACULTY_DEAN)",
};

const ASSIGNEE_TYPE_OPTIONS: { value: AssigneeType; label: string }[] = Object.values(AssigneeType).map((v) => ({
  value: v,
  label: ASSIGNEE_TYPE_LABELS[v],
}));

// A head/dean step resolves to "the holder of this role, scoped to that unit",
// so it needs a role exactly as much as a SPECIFIC_ROLE step does. The form
// used to offer the role picker for SPECIFIC_ROLE only, which made it
// impossible to author a routable head or dean step: every one of them was
// saved with no role and arrived unassigned.
// Types that can carry a department. SPECIFIC_UNIT must have one; a role step
// may have one, and the picker has to be on screen for that to be possible --
// while it was rendered for SPECIFIC_UNIT alone, every role step was saved
// unscoped and routing had no department to prefer.
const DEPARTMENT_CAPABLE_TYPES: AssigneeType[] = [
  AssigneeType.SPECIFIC_UNIT,
  AssigneeType.SPECIFIC_ROLE,
]

const ROLE_REQUIRED_TYPES: AssigneeType[] = [
  AssigneeType.SPECIFIC_ROLE,
  AssigneeType.REQUESTER_DEPARTMENT_HEAD,
  AssigneeType.REQUESTER_FACULTY_DEAN,
];

// Initial empty step
function createEmptyStep(): WorkflowStepDto {
  return {
    key: '',
    name: { ar: '', en: '' },
    description: { ar: '', en: '' },
    assigneeType: AssigneeType.SPECIFIC_UNIT,
    assigneeRoleId: undefined,
    assigneeDepartmentId: undefined,
    defaultActionTypeId: undefined,
    slaHours: undefined,
    pausesSla: undefined,
    feeAmount: undefined,
    feeCurrency: undefined,
    allowedActionTypeIds: undefined,
    dependsOn: undefined,
  };
}

export function WorkflowPathForm({ templateId: fixedTemplateId, existing }: Props) {
  const router = useRouter();
  const defineWorkflowPath = useDefineWorkflowPath();

  // Fetch data for dropdowns
  const { data: templatesData } = useTemplateHook(true); // includeActive = true
  const { data: rolesData } = useRoles();
  const { data: departmentTreeData, isLoading: departmentsLoading } = useDepartmentTree(true); // activeOnly = true
  // Terminal action types only. A non-terminal code (FORWARD, REQUEST_PAYMENT)
  // describes work that continues, and the step form maps anything it does not
  // recognise as a rejection or a skip onto COMPLETE -- so offering one here
  // would let an author arm a step that silently finishes instead of carrying
  // on. The server refuses them as well; this keeps them off the screen.
  const { data: actionTypesData } = useActionTypes(true);

  const templates = templatesData ?? [];
  const roles = rolesData ?? [];
  const actionTypes = actionTypesData ?? [];
  const fixedTemplate = fixedTemplateId ? templates.find((t) => t.id === fixedTemplateId) : undefined;

  // Flatten department tree for select
  const flatDepartments = useMemo(() => {
    if (!departmentTreeData) return [];
    function flatten(
      nodes: { id: string; name: { ar: string; en?: string }; parentId: string | null; children: any[] }[],
      prefix = ''
    ): { id: string; name: { ar: string; en?: string }; parentId: string | null }[] {
      return nodes.flatMap((node) => [
        { id: node.id, name: node.name, parentId: node.parentId },
        ...flatten(node.children ?? [], `${prefix}${node.name.ar} / `),
      ]);
    }
    return flatten(departmentTreeData);
  }, [departmentTreeData]);

  // Form state
  const [templateId, setTemplateId] = useState<string>(fixedTemplateId ?? '');
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [steps, setSteps] = useState<WorkflowStepDto[]>([createEmptyStep()]);
  const [activate, setActivate] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = defineWorkflowPath.isPending;

  function getStepLabel(step: WorkflowStepDto, index: number): string {
    return step.key ? `${index + 1}. ${step.key} — ${step.name.ar}` : `${index + 1}. (no key yet)`;
  }

  function updateStep(index: number, updates: Partial<WorkflowStepDto>) {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }

  function addStep() {
    setSteps((prev) => [...prev, createEmptyStep()]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function goBackToPathsList() {
    router.push(templateId ? `/dashboard/templates/${templateId}/workflow-paths` : '/dashboard/templates');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const name: LocalizedTextDto = { ar: nameAr.trim(), en: nameEn.trim() || undefined };
    const description =
      descriptionAr.trim() || descriptionEn.trim()
        ? { ar: descriptionAr.trim(), en: descriptionEn.trim() || undefined }
        : undefined;

    const request: DefineWorkflowPathDto = {
      templateId,
      name,
      description,
      steps: steps.map((s) => ({
        key: s.key.trim(),
        name: { ar: s.name.ar.trim(), en: s.name.en?.trim() || undefined },
        description:
          s.description?.ar?.trim() || s.description?.en?.trim()
            ? { ar: s.description?.ar?.trim(), en: s.description?.en?.trim() || undefined }
            : undefined,
        assigneeType: s.assigneeType,
        assigneeRoleId: s.assigneeRoleId || undefined,
        assigneeDepartmentId: s.assigneeDepartmentId || undefined,
        defaultActionTypeId: s.defaultActionTypeId?.trim() || undefined,
        slaHours: s.slaHours,
        pausesSla: s.pausesSla,
        feeAmount: s.feeAmount,
        // Only meaningful alongside an amount; the backend defaults it to SYP.
        feeCurrency: s.feeAmount !== undefined ? (s.feeCurrency?.trim().toUpperCase() || undefined) : undefined,
        allowedActionTypeIds: s.allowedActionTypeIds?.filter((c) => c.trim()) || undefined,
        dependsOn: s.dependsOn?.filter((k) => k.trim()) || undefined,
      })),
      activate,
    };

    const result = defineWorkflowPathSchema.safeParse(request);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setSubmitError(firstIssue.message);
      return;
    }

    try {
      await defineWorkflowPath.mutateAsync(result.data);
      router.push(`/dashboard/templates/${result.data.templateId}/workflow-paths`);
    } catch {
      setSubmitError('Failed to create workflow path. Please check the values and try again.');
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Define Workflow Path</CardTitle>
        <CardDescription>
          Create a new workflow path for a template. Define the steps, their assignees,
          dependencies, and SLA settings. The path can be activated immediately or later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template — locked to the route's template when provided, otherwise a picker */}
          <div className="space-y-1">
            <Label htmlFor="templateId">Template <span className="text-destructive">*</span></Label>
            {fixedTemplateId ? (
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                {fixedTemplate
                  ? `${fixedTemplate.nameAr}${fixedTemplate.nameEn ? ` (${fixedTemplate.nameEn})` : ''}`
                  : 'Loading template…'}
              </div>
            ) : (
              <>
                <select
                  id="templateId"
                  className={selectClass}
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  disabled={isPending}
                  required
                >
                  <option value="">— select template —</option>
                  {templates
                    .filter((t) => t.isActive)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nameAr}{t.nameEn && ` (${t.nameEn})`} {t.code && ` [${t.code}]`}
                      </option>
                    ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-xs text-muted-foreground">No active templates available.</p>
                )}
              </>
            )}
          </div>

          {/* Workflow path name */}
          <div className="space-y-1">
            <Label htmlFor="nameAr">Name (Arabic) <span className="text-destructive">*</span></Label>
            <Input
              id="nameAr"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              disabled={isPending}
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="nameEn">Name (English)</Label>
            <Input
              id="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="descriptionAr">Description (Arabic)</Label>
            <Input
              id="descriptionAr"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="descriptionEn">Description (English)</Label>
            <Input
              id="descriptionEn"
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              disabled={isPending}
              maxLength={255}
            />
          </div>

          <Separator />

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Steps ({steps.length})</h3>
              <Button type="button" variant="outline" size="sm" onClick={addStep} disabled={isPending}>
                + Add Step
              </Button>
            </div>

            {steps.map((step, index) => (
              <div
                key={`${index}-${step.key || 'new'}`}
                className="border rounded-lg p-4 space-y-4 bg-card"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Step {index + 1}
                    {step.key && <span className="text-sm text-muted-foreground ml-2">({step.key})</span>}
                  </h4>
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                      title="Remove step"
                    >
                      🗑
                    </Button>
                  )}
                </div>

                {/* Key */}
                <div className="space-y-1">
                  <Label htmlFor={`step-${index}-key`}>Key <span className="text-destructive">*</span></Label>
                  <Input
                    id={`step-${index}-key`}
                    value={step.key}
                    onChange={(e) => updateStep(index, { key: e.target.value })}
                    disabled={isPending}
                    required
                    maxLength={100}
                    placeholder="e.g., review, approve, sign"
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier for this step (used in dependsOn). Lowercase, no spaces.
                  </p>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-nameAr`}>Name (Arabic) <span className="text-destructive">*</span></Label>
                    <Input
                      id={`step-${index}-nameAr`}
                      value={step.name.ar}
                      onChange={(e) => updateStep(index, { name: { ...step.name, ar: e.target.value } })}
                      disabled={isPending}
                      required
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-nameEn`}>Name (English)</Label>
                    <Input
                      id={`step-${index}-nameEn`}
                      value={step.name.en ?? ''}
                      onChange={(e) => updateStep(index, { name: { ...step.name, en: e.target.value || undefined } })}
                      disabled={isPending}
                      maxLength={255}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-descAr`}>Description (Arabic)</Label>
                    <Input
                      id={`step-${index}-descAr`}
                      value={step.description?.ar ?? ''}
                      onChange={(e) =>
                        updateStep(index, {
                          description: { ...(step.description ?? { ar: '', en: '' }), ar: e.target.value },
                        })
                      }
                      disabled={isPending}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-descEn`}>Description (English)</Label>
                    <Input
                      id={`step-${index}-descEn`}
                      value={step.description?.en ?? ''}
                      onChange={(e) =>
                        updateStep(index, {
                          description: { ...(step.description ?? { ar: '', en: '' }), en: e.target.value || undefined },
                        })
                      }
                      disabled={isPending}
                      maxLength={255}
                    />
                  </div>
                </div>

                {/* Assignee type */}
                <div className="space-y-1">
                  <Label htmlFor={`step-${index}-assigneeType`}>Assignee type <span className="text-destructive">*</span></Label>
                  <select
                    id={`step-${index}-assigneeType`}
                    className={selectClass}
                    value={step.assigneeType}
                    onChange={(e) => updateStep(index, { assigneeType: e.target.value as AssigneeType })}
                    disabled={isPending}
                    required
                  >
                    {ASSIGNEE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional fields based on assigneeType */}
                {ROLE_REQUIRED_TYPES.includes(step.assigneeType) && (
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-assigneeRoleId`}>
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id={`step-${index}-assigneeRoleId`}
                      className={selectClass}
                      value={step.assigneeRoleId ?? ''}
                      onChange={(e) => updateStep(index, { assigneeRoleId: e.target.value || undefined })}
                      disabled={isPending}
                      required
                    >
                      <option value="">— select role —</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name.ar}{r.name.en && ` (${r.name.en})`}
                        </option>
                      ))}
                    </select>
                    {roles.length === 0 && (
                      <p className="text-xs text-muted-foreground">No roles available.</p>
                    )}
                  </div>
                )}

                {DEPARTMENT_CAPABLE_TYPES.includes(step.assigneeType) && (
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-assigneeDepartmentId`}>
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id={`step-${index}-assigneeDepartmentId`}
                      className={selectClass}
                      value={step.assigneeDepartmentId ?? ''}
                      onChange={(e) => updateStep(index, { assigneeDepartmentId: e.target.value || undefined })}
                      disabled={isPending || departmentsLoading}
                      required
                    >
                      <option value="">— select department —</option>
                      {flatDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name.ar}{d.name.en && ` (${d.name.en})`}
                        </option>
                      ))}
                    </select>
                    {departmentsLoading && (
                      <p className="text-xs text-muted-foreground">Loading departments…</p>
                    )}
                    {!departmentsLoading && flatDepartments.length === 0 && (
                      <p className="text-xs text-destructive">
                        No departments exist yet. Create one before defining this step.
                      </p>
                    )}
                  </div>
                )}

                <Separator className="my-2" />

                {/* Optional fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* defaultActionTypeId - single select from all action types */}
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-defaultActionTypeId`}>Default action type (optional, terminal only)</Label>
                    <select
                      id={`step-${index}-defaultActionTypeId`}
                      className={selectClass}
                      value={step.defaultActionTypeId ?? ''}
                      onChange={(e) => updateStep(index, { defaultActionTypeId: e.target.value || undefined })}
                      disabled={isPending}
                    >
                      <option value="">— select action type —</option>
                      {actionTypes.map((at) => (
                        <option key={at.id} value={at.id}>
                          {at.name.ar}{at.name.en && ` (${at.name.en})`} [{at.code}]
                        </option>
                      ))}
                    </select>
                    {actionTypes.length === 0 && (
                      <p className="text-xs text-muted-foreground">No terminal action types available.</p>
                    )}
                  </div>

                  {/* slaHours */}
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-slaHours`}>SLA hours (optional)</Label>
                    <Input
                      id={`step-${index}-slaHours`}
                      type="number"
                      min="1"
                      value={step.slaHours ?? ''}
                      onChange={(e) => updateStep(index, { slaHours: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                      disabled={isPending}
                      placeholder="e.g., 24"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* pausesSla */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`step-${index}-pausesSla`}
                        checked={step.pausesSla ?? false}
                        onCheckedChange={(checked) => updateStep(index, { pausesSla: checked })}
                        disabled={isPending}
                      />
                      <Label htmlFor={`step-${index}-pausesSla`} className="mb-0">
                        Pauses SLA
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Time spent in this step doesn't count toward SLA.
                    </p>
                  </div>

                  {/* allowedActionTypeIds - multi-select from terminal action types */}
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-allowedActionTypeIds`}>
                      Allowed action types (optional)
                    </Label>
                    <select
                      id={`step-${index}-allowedActionTypeIds`}
                      className={selectClass}
                      multiple
                      value={step.allowedActionTypeIds ?? []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                        updateStep(index, { allowedActionTypeIds: selected.length > 0 ? selected : undefined });
                      }}
                      disabled={isPending}
                      style={{ minHeight: '100px' }}
                    >
                      {actionTypes.map((at) => (
                        <option key={at.id} value={at.id}>
                          {at.name.ar}{at.name.en && ` (${at.name.en})`} [{at.code}]
                        </option>
                      ))}
                    </select>
                    {actionTypes.length === 0 && (
                      <p className="text-xs text-muted-foreground">No terminal action types available.</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Hold Ctrl/Cmd to select multiple. Terminal action types only (actions that end a request's journey).
                    </p>
                  </div>
                </div>

                {/* Fee -- charged when the step starts, blocks completion until settled */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-feeAmount`}>Fee amount (optional)</Label>
                    <Input
                      id={`step-${index}-feeAmount`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={step.feeAmount ?? ''}
                      onChange={(e) =>
                        updateStep(index, {
                          feeAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      disabled={isPending}
                      placeholder="e.g., 5000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Charged when this step is started. The step cannot be completed
                      until the fee is confirmed or waived. Leave empty for a free step.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-feeCurrency`}>Currency</Label>
                    <Input
                      id={`step-${index}-feeCurrency`}
                      value={step.feeCurrency ?? ''}
                      onChange={(e) =>
                        updateStep(index, { feeCurrency: e.target.value.toUpperCase() || undefined })
                      }
                      disabled={isPending || step.feeAmount === undefined}
                      maxLength={3}
                      placeholder="SYP"
                    />
                    <p className="text-xs text-muted-foreground">
                      3-letter ISO code. Defaults to SYP.
                    </p>
                  </div>
                </div>

                {/* dependsOn */}
                <div className="space-y-1">
                  <Label htmlFor={`step-${index}-dependsOn`}>Depends on steps (optional)</Label>
                  <select
                    id={`step-${index}-dependsOn`}
                    className={selectClass}
                    multiple
                    value={step.dependsOn ?? []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                      updateStep(index, { dependsOn: selected.length > 0 ? selected : undefined });
                    }}
                    disabled={isPending}
                    style={{ minHeight: '80px' }}
                  >
                    {steps
                      .filter((_, i) => i !== index && steps[i].key)
                      .map((s, i) => {
                        const realIndex = steps.findIndex((st) => st === s);
                        return (
                          <option key={s.key} value={s.key}>
                            {getStepLabel(s, realIndex)}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Hold Ctrl/Cmd to select multiple. Only steps with keys appear here.
                  </p>
                </div>
              </div>
            ))}

            {steps.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No steps defined yet. Click "Add Step" to start.
              </p>
            )}
          </div>

          <Separator />

          {/* Activate option */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="activate"
                checked={activate}
                onCheckedChange={(checked) => setActivate(checked)}
                disabled={isPending}
              />
              <Label htmlFor="activate" className="mb-0">
                Activate immediately (make this the default path for the template)
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Only one active path per template. Activating will deactivate any existing active path.
            </p>
          </div>

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Creating…' : 'Create Workflow Path'}
            </Button>
            <Button type="button" variant="outline" onClick={goBackToPathsList} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
'use client';
// src/components/forms/workflow-path-form.tsx
//
// Form for defining a new workflow path for a template.
// POST /workflow-paths
//
// Notes:
// - templateId is required (dropdown from active templates) — Case (a): GET /templates exists.
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
    allowedActionTypeIds: undefined,
    dependsOn: undefined,
  };
}

export function WorkflowPathForm({ existing }: Props) {
  const router = useRouter();
  const defineWorkflowPath = useDefineWorkflowPath();

  // Fetch data for dropdowns
  const { data: templatesData } = useTemplateHook(true); // includeActive = true
  const { data: rolesData } = useRoles();
  const { data: departmentTreeData } = useDepartmentTree(true); // activeOnly = true
  const { data: actionTypesData } = useActionTypes(); // all action types for defaultActionTypeId

  const templates = templatesData ?? [];
  const roles = rolesData ?? [];
  const actionTypes = actionTypesData ?? [];

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
  const [templateId, setTemplateId] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [steps, setSteps] = useState<WorkflowStepDto[]>([createEmptyStep()]);
  const [activate, setActivate] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = defineWorkflowPath.isPending;

  // Helper to get step label for dependsOn dropdown
  function getStepLabel(step: WorkflowStepDto, index: number): string {
    return step.key ? `${index + 1}. ${step.key} — ${step.name.ar}` : `${index + 1}. (no key yet)`;
  }

  // Update a single step
  function updateStep(index: number, updates: Partial<WorkflowStepDto>) {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  }

  // Add a new step
  function addStep() {
    setSteps((prev) => [...prev, createEmptyStep()]);
  }

  // Remove a step
  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Assemble request object from form state
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
        allowedActionTypeIds: s.allowedActionTypeIds?.filter((c) => c.trim()) || undefined,
        dependsOn: s.dependsOn?.filter((k) => k.trim()) || undefined,
      })),
      activate,
    };

    // Validate with Zod schema
    const result = defineWorkflowPathSchema.safeParse(request);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setSubmitError(firstIssue.message);
      return;
    }

    try {
      await defineWorkflowPath.mutateAsync(result.data);
      router.push('/dashboard/workflow-paths');
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
          {/* Template selector — Case (a): real listing endpoint exists */}
          <div className="space-y-1">
            <Label htmlFor="templateId">Template <span className="text-destructive">*</span></Label>
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
                {step.assigneeType === AssigneeType.SPECIFIC_ROLE && roles.length > 0 && (
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

                {step.assigneeType === AssigneeType.SPECIFIC_UNIT && flatDepartments.length > 0 && (
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-assigneeDepartmentId`}>
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id={`step-${index}-assigneeDepartmentId`}
                      className={selectClass}
                      value={step.assigneeDepartmentId ?? ''}
                      onChange={(e) => updateStep(index, { assigneeDepartmentId: e.target.value || undefined })}
                      disabled={isPending}
                      required
                    >
                      <option value="">— select department —</option>
                      {flatDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name.ar}{d.name.en && ` (${d.name.en})`}
                        </option>
                      ))}
                    </select>
                    {flatDepartments.length === 0 && (
                      <p className="text-xs text-muted-foreground">No departments available.</p>
                    )}
                  </div>
                )}

                <Separator className="my-2" />

                {/* Optional fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* defaultActionTypeId - single select from all action types */}
                  <div className="space-y-1">
                    <Label htmlFor={`step-${index}-defaultActionTypeId`}>Default action type (optional)</Label>
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
                      <p className="text-xs text-muted-foreground">No action types available.</p>
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
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/workflow-paths')} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
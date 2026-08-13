/**
 * Unit tests for the routing engine.
 *
 * Eight cases, each one a rule that was either wrong at some point or is
 * expensive to prove by hand. No database, no Nest container, no HTTP: the
 * resolver is constructed directly with a fake directory, so every test is a
 * statement about the rule and nothing else.
 */
import { AssigneeResolver } from './assignee-resolver'
import { Identifier } from '../../../domain/shared/identifier'
import { AssigneeType } from '../../../domain/workflow/enums'
import {
  fakeDirectory,
  type FakeDirectoryData,
} from '../../../../test-support/fake-directory'
import {
  buildPath,
  buildStep,
  ownerOf,
} from '../../../../test-support/workflow.builder'

const REQUESTER = 'u-requester'
const requesterId = Identifier.of(REQUESTER)

/** Art faculty -> Fine Arts department, the shape used by the manual test plan. */
const UNITS = [
  { id: 'uni', kind: 'UNIVERSITY' as const },
  { id: 'fac-art', kind: 'FACULTY' as const, parentId: 'uni' },
  { id: 'dep-fine-arts', kind: 'DEPARTMENT' as const, parentId: 'fac-art' },
  { id: 'dep-music', kind: 'DEPARTMENT' as const, parentId: 'fac-art' },
]

function resolverWith(data: FakeDirectoryData) {
  const directory = fakeDirectory({ units: UNITS, ...data })
  return { directory, resolver: new AssigneeResolver(directory) }
}

/** The requester: a student in Fine Arts, holding no role at all. */
const requesterRow = { id: REQUESTER, departmentId: 'dep-fine-arts' }

describe('AssigneeResolver', () => {
  // ── 1 ──────────────────────────────────────────────────────────────────
  describe('a role step with no role (a row from before the invariant)', () => {
    it('is left unassigned and never reaches the directory', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          requesterRow,
          { id: 'u-stranger', roles: [{ roleId: 'r-secretary' }] },
        ],
      })
      const path = buildPath({
        steps: [
          {
            id: 's1',
            assigneeType: AssigneeType.SPECIFIC_ROLE,
            legacy: true, // no roleId: only rehydrate() allows this
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      // Unassigned is the correct answer. A candidate query carrying neither
      // role nor department would have matched every active user, and the step
      // would have been handed to whichever stranger was least busy.
      expect(owners.size).toBe(0)
      expect(directory.calls).toHaveLength(0)
    })
  })

  // ── 2 ──────────────────────────────────────────────────────────────────
  describe('a step naming a role but no department', () => {
    const users = [
      requesterRow,
      {
        id: 'u-local-secretary',
        departmentId: 'dep-fine-arts',
        roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
        openStepCount: 5,
      },
      {
        id: 'u-global-secretary',
        roles: [{ roleId: 'r-secretary' }],
        openStepCount: 0,
      },
    ]
    const path = buildPath({
      steps: [
        {
          id: 's1',
          assigneeType: AssigneeType.SPECIFIC_ROLE,
          roleId: 'r-secretary',
        },
      ],
    })

    it('prefers the requester\u2019s own desk without narrowing the pool', async () => {
      const { directory, resolver } = resolverWith({ users })

      await resolver.resolveForPath(path, requesterId)

      expect(directory.calls[0]).toEqual({
        roleId: 'r-secretary',
        departmentId: undefined,
        preferDepartmentId: 'dep-fine-arts',
        requireScoped: false,
        excludeUserId: REQUESTER,
      })
    })

    it('sends the step to the local desk even when a global holder is idler', async () => {
      const { resolver } = resolverWith({ users })

      const owners = await resolver.resolveForPath(path, requesterId)

      // The bug this pins down: with locality as a tie-break, the local desk
      // won only until it was one item busier, so requests 1 and 2 routed
      // locally and request 3 silently left the department.
      expect(ownerOf(owners, 's1')).toBe('u-local-secretary')
    })

    it('falls back to a holder elsewhere when the requester\u2019s unit has nobody', async () => {
      const { resolver } = resolverWith({
        users: [
          requesterRow,
          {
            id: 'u-global-secretary',
            roles: [{ roleId: 'r-secretary' }],
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(ownerOf(owners, 's1')).toBe('u-global-secretary')
    })
  })

  // ── 3 ──────────────────────────────────────────────────────────────────
  describe('a step naming its own department', () => {
    it('scopes the query instead of merely preferring it', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          requesterRow,
          {
            id: 'u-registry',
            roles: [{ roleId: 'r-clerk', departmentId: 'dep-music' }],
          },
        ],
      })
      const path = buildPath({
        steps: [
          {
            id: 's1',
            assigneeType: AssigneeType.SPECIFIC_ROLE,
            roleId: 'r-clerk',
            departmentId: 'dep-music',
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      // A step that names a department has already said where the work belongs,
      // so the requester's own unit must not be consulted at all.
      expect(directory.calls[0]).toEqual({
        roleId: 'r-clerk',
        departmentId: 'dep-music',
        preferDepartmentId: undefined,
        requireScoped: false,
        excludeUserId: REQUESTER,
      })
      expect(ownerOf(owners, 's1')).toBe('u-registry')
    })

    it('requires an exact scope for a SPECIFIC_UNIT step', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          requesterRow,
          // Holds a role globally, so they are attached to no unit at all.
          { id: 'u-floating', roles: [{ roleId: 'r-clerk' }] },
          {
            id: 'u-in-registry',
            roles: [{ roleId: 'r-clerk', departmentId: 'dep-music' }],
          },
        ],
      })
      const path = buildPath({
        steps: [
          {
            id: 's1',
            assigneeType: AssigneeType.SPECIFIC_UNIT,
            departmentId: 'dep-music',
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(directory.calls[0]?.requireScoped).toBe(true)
      expect(ownerOf(owners, 's1')).toBe('u-in-registry')
    })
  })

  // ── 4 ──────────────────────────────────────────────────────────────────
  describe('load balancing', () => {
    it('picks the least busy holder inside the tier', async () => {
      const { resolver } = resolverWith({
        users: [
          requesterRow,
          {
            id: 'u-busy',
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
            openStepCount: 4,
          },
          {
            id: 'u-free',
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
            openStepCount: 1,
          },
        ],
      })
      const path = buildPath({
        steps: [{ id: 's1', roleId: 'r-secretary' }],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(ownerOf(owners, 's1')).toBe('u-free')
    })

    it('spreads two steps of one path across the same pool', async () => {
      const { resolver } = resolverWith({
        users: [
          requesterRow,
          {
            id: 'u-a',
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
          },
          {
            id: 'u-b',
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
          },
        ],
      })
      const path = buildPath({
        steps: [
          { id: 's1', roleId: 'r-secretary' },
          { id: 's2', roleId: 'r-secretary' },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      // Both start at zero open steps, so without the in-run load counter both
      // steps would land on the same person.
      expect(ownerOf(owners, 's1')).toBe('u-a')
      expect(ownerOf(owners, 's2')).toBe('u-b')
    })
  })

  // ── 5 ──────────────────────────────────────────────────────────────────
  describe('the requester', () => {
    it('is excluded from every candidate query', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          {
            ...requesterRow,
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
          },
          {
            id: 'u-colleague',
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
          },
        ],
      })
      const path = buildPath({
        steps: [{ id: 's1', roleId: 'r-secretary' }],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(directory.calls[0]?.excludeUserId).toBe(REQUESTER)
      expect(ownerOf(owners, 's1')).toBe('u-colleague')
    })

    it('escalates a head step up the org tree when they are the only head', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          {
            ...requesterRow,
            // The requester IS the head of their own department.
            roles: [{ roleId: 'r-head', departmentId: 'dep-fine-arts' }],
          },
          {
            id: 'u-faculty-head',
            roles: [{ roleId: 'r-head', departmentId: 'fac-art' }],
          },
        ],
      })
      const path = buildPath({
        steps: [
          {
            id: 's1',
            assigneeType: AssigneeType.REQUESTER_DEPARTMENT_HEAD,
            roleId: 'r-head',
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      // Asked the department first, then its parent: a department head's own
      // request is approved by their supervisor, not by themselves.
      expect(
        directory.calls.map((call) => call.departmentId),
      ).toEqual(['dep-fine-arts', 'fac-art'])
      expect(directory.calls.every((call) => call.requireScoped === true)).toBe(
        true,
      )
      expect(ownerOf(owners, 's1')).toBe('u-faculty-head')
    })

    it('leaves a head step unassigned when the requester has no department', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          { id: REQUESTER }, // an external applicant: no home unit
          {
            id: 'u-faculty-head',
            roles: [{ roleId: 'r-head', departmentId: 'fac-art' }],
          },
        ],
      })
      const path = buildPath({
        steps: [
          {
            id: 's1',
            assigneeType: AssigneeType.REQUESTER_DEPARTMENT_HEAD,
            roleId: 'r-head',
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(owners.size).toBe(0)
      expect(directory.calls).toHaveLength(0)
    })
  })

  // ── 6 ──────────────────────────────────────────────────────────────────
  describe('a dean step', () => {
    const path = buildPath({
      steps: [
        {
          id: 's1',
          assigneeType: AssigneeType.REQUESTER_FACULTY_DEAN,
          roleId: 'r-dean',
        },
      ],
    })

    it('resolves through the faculty that owns the requester\u2019s department', async () => {
      const { directory, resolver } = resolverWith({
        users: [
          requesterRow,
          {
            id: 'u-dean',
            roles: [{ roleId: 'r-dean', departmentId: 'fac-art' }],
          },
          // A dean of another faculty must not be eligible.
          {
            id: 'u-other-dean',
            roles: [{ roleId: 'r-dean', departmentId: 'fac-science' }],
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(directory.calls[0]?.departmentId).toBe('fac-art')
      expect(ownerOf(owners, 's1')).toBe('u-dean')
    })

    it('is left unassigned when the department hangs under no faculty', async () => {
      const { resolver } = resolverWith({
        users: [
          { id: REQUESTER, departmentId: 'dep-orphan' },
          {
            id: 'u-dean',
            roles: [{ roleId: 'r-dean', departmentId: 'fac-art' }],
          },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(owners.size).toBe(0)
    })
  })

  // ── 7 ──────────────────────────────────────────────────────────────────
  describe('delegation', () => {
    const path = buildPath({
      steps: [{ id: 's1', roleId: 'r-secretary' }],
    })
    const secretary = {
      id: 'u-secretary',
      roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
    }

    it('redirects the chosen owner to their stand-in', async () => {
      const { resolver } = resolverWith({
        users: [requesterRow, secretary, { id: 'u-standin' }],
        delegations: [{ from: 'u-secretary', to: 'u-standin' }],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(ownerOf(owners, 's1')).toBe('u-standin')
    })

    it('follows a chain of delegations to its end', async () => {
      const { resolver } = resolverWith({
        users: [requesterRow, secretary, { id: 'u-b' }, { id: 'u-c' }],
        delegations: [
          { from: 'u-secretary', to: 'u-b' },
          { from: 'u-b', to: 'u-c' },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(ownerOf(owners, 's1')).toBe('u-c')
    })

    it('stops on a cycle instead of looping forever', async () => {
      const { resolver } = resolverWith({
        users: [requesterRow, secretary, { id: 'u-b' }],
        delegations: [
          { from: 'u-secretary', to: 'u-b' },
          { from: 'u-b', to: 'u-secretary' },
        ],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      expect(ownerOf(owners, 's1')).toBe('u-b')
    })

    it('refuses to let a delegation land the step on the requester', async () => {
      const { resolver } = resolverWith({
        users: [requesterRow, secretary],
        delegations: [{ from: 'u-secretary', to: REQUESTER }],
      })

      const owners = await resolver.resolveForPath(path, requesterId)

      // Self-approval must not be reachable through a delegation either.
      expect(ownerOf(owners, 's1')).toBe('u-secretary')
    })
  })

  // ── 8 ──────────────────────────────────────────────────────────────────
  describe('a step nobody can take', () => {
    const users = [
      requesterRow,
      {
        id: 'u-secretary',
        roles: [{ roleId: 'r-secretary', departmentId: 'dep-fine-arts' }],
      },
    ]
    const path = buildPath({
      steps: [
        // Nobody is scoped to this unit.
        {
          id: 's1',
          assigneeType: AssigneeType.SPECIFIC_UNIT,
          departmentId: 'dep-empty',
        },
        { id: 's2', roleId: 'r-secretary' },
      ],
    })

    it('is skipped without failing the rest of the pass', async () => {
      const { resolver } = resolverWith({ users })

      const owners = await resolver.resolveForPath(path, requesterId)

      // Starting a request must never fail because a downstream desk is vacant;
      // the step stays unassigned and an admin is notified.
      expect(owners.has('s1')).toBe(false)
      expect(ownerOf(owners, 's2')).toBe('u-secretary')
    })

    it('routes only the steps the caller asked about', async () => {
      const { directory, resolver } = resolverWith({ users })

      const owners = await resolver.resolveForPath(
        path,
        requesterId,
        new Set(['s2']),
      )

      // Charging a candidate for a step nobody can start yet would push the
      // next real step onto somebody else.
      expect([...owners.keys()]).toEqual(['s2'])
      expect(directory.calls).toHaveLength(1)
    })

    it('offers an admin a wider tier for manual assignment', async () => {
      const { resolver } = resolverWith({
        users: [
          requesterRow,
          {
            id: 'u-elsewhere',
            roles: [{ roleId: 'r-secretary', departmentId: 'dep-music' }],
          },
        ],
      })
      const step = buildStep({
        id: 's1',
        roleId: 'r-secretary',
        departmentId: 'dep-empty',
      })

      const { recommended, wider } = await resolver.assignableUsersForStep(
        step,
        requesterId,
      )

      expect(recommended).toHaveLength(0)
      expect(wider.map((candidate) => candidate.userId)).toEqual([
        'u-elsewhere',
      ])
    })
  })
})

# opsx-workflow Specification

## Purpose
TBD - created by archiving change harden-opsx-workflow. Update Purpose after archive.
## Requirements
### Requirement: Proposal artifacts SHALL declare non-code operational surfaces

The proposal-generation step SHALL require planners to enumerate non-code surfaces that the change touches or relies on, or to explicitly mark each surface `N/A` with a one-line reason.

Required surfaces:
- Config load mechanics (file path, env-overlay rules, ConfigMap mount, deployment-time substitution)
- Secret sources (environment variables, secret manager, mounted files)
- Container/deploy artifacts (Dockerfile entry points, helm charts, argocd-apps definitions)
- CI workflow scripts (lint, test, fmt, build, deploy)
- Observability endpoints (tracing, logging, dashboards, alerts)

#### Scenario: Brownfield proposal omits non-code surfaces
- **WHEN** `/opsx:propose` generates `proposal.md` for a change whose `Starting state` is `brownfield` and the planner has not declared non-code surfaces
- **THEN** the skill SHALL pause and prompt the planner to enumerate each required surface or mark it `N/A` before writing the artifact

#### Scenario: Greenfield proposal still records surfaces
- **WHEN** `/opsx:propose` generates `proposal.md` for a greenfield change
- **THEN** the resulting `proposal.md` SHALL include the `## Non-code surfaces` section, with each surface filled or marked `N/A` and reason

### Requirement: Proposal artifacts SHALL declare starting state and cutover style

The proposal-generation step SHALL require an explicit `Starting state` field (`brownfield` | `greenfield`) and a `Cutover` field (`greenfield` | `parallel-run` | `strangler` | `in-place`).

#### Scenario: Missing starting state on a brownfield change
- **WHEN** `/opsx:propose` is invoked on a repo with prior code in the affected scope and the planner does not specify `Starting state`
- **THEN** the skill SHALL ask the planner explicitly which state applies before writing `proposal.md`

#### Scenario: Cutover style flows to downstream artifacts
- **WHEN** `proposal.md` declares `Cutover: from-scratch` (greenfield)
- **THEN** subsequent `design.md` generation SHALL NOT require a "Migration plan" section, and `/opsx:propose` SHALL skip the legacy gap-analysis pre-pass

### Requirement: Design artifacts SHALL declare delivery shape

The design-generation step SHALL require a `## Delivery shape` section capturing PR shape, base branch, repo merge-method, and the named `/opsx:*` skill invocations per boundary.

Required fields:
- PR shape (one PR / per-capability stack / per-capability parallel / per-service stack)
- Base branch (integration branch name if any, target main branch)
- Repo merge-method (`squash` | `merge` | `rebase`) — must match the GitHub repo setting
- Skills invoked per boundary (which `/opsx:*` commands run at propose-end, capability-start, capability-end, archive)

#### Scenario: Stacked PR shape without merge-method preflight
- **WHEN** `design.md` declares a per-capability stack and does not declare `Repo merge-method`
- **THEN** the skill SHALL prompt the planner to confirm the repo's merge-method (and SHALL warn if the combination is `stack + squash`, naming the rebase recipe in the warning)

#### Scenario: Skill invocations enumerated
- **WHEN** `design.md` is generated for any change
- **THEN** the `## Delivery shape` section SHALL list at minimum the `/opsx:*` commands expected to run at each boundary (`propose`, `apply`, `review`, `pr`, `archive`), or explicitly note the boundary is skipped

### Requirement: Specs SHALL include a legacy-exactness precedence note for brownfield changes

For brownfield changes that reference legacy code, generated `specs/<capability>/spec.md` files SHALL include or inherit a precedence note: when scenario wording conflicts with a directive to "match legacy `<file>` exactly," the legacy code is authoritative.

#### Scenario: Spec scenario contradicts legacy
- **WHEN** an implementing agent finds a WHEN/THEN scenario whose wording would produce different behavior than the legacy file referenced elsewhere in the spec
- **THEN** the agent SHALL follow the legacy file's behavior, record the discrepancy in the PR body, and flag the spec for `/opsx:refine`

### Requirement: Task lists SHALL enumerate adjacent references for any file deletion

When a capability deletes a file, `tasks.md` SHALL include a companion task listing adjacent references (Dockerfile, package.json, helm charts, CI workflows, argocd-apps) that must be updated in the same capability or an explicitly named follow-up capability.

#### Scenario: Legacy entry point deletion
- **WHEN** a task deletes `src/<entrypoint>.ts`
- **THEN** the next task SHALL enumerate every reference to `dist/<entrypoint>.js` and `<entrypoint>` in Dockerfile `CMD`/`ENTRYPOINT`, `package.json` `main`/`bin`, helm `command:` lines, and CI workflow scripts, and require updating each

#### Scenario: File rename
- **WHEN** a task renames a file
- **THEN** the same task SHALL include reference cleanup or explicitly defer it to a named follow-up capability (not "TODO later")

### Requirement: Build skills SHALL apply an ambiguity escalation contract

The `/opsx:propose`, `/opsx:apply`, `/opsx:refine`, and `/opsx:pr` skills SHALL distinguish between **must-ask** and **may-decide** classes of ambiguity.

Must-ask classes (escalate to user, never decide silently):
1. Conflict between spec scenario wording and legacy code on a brownfield change.
2. Cutover style if not specified in the proposal.
3. Repo merge-method when choosing a stacked-PR delivery shape.
4. Deletion of files not explicitly listed in `tasks.md`.
5. Promotion of transitive dependencies to direct dependencies.
6. Library-vs-spec surface mismatches (spec calls a method the library does not expose).
7. Any choice between two equally-plausible interpretations of a WHEN/THEN scenario.

May-decide classes (proceed with reasonable default, log the decision):
- Naming derivations within an established convention.
- Test scaffolding shape when the sibling-service pattern is unambiguous.
- Formatting / lint-clean fixes that do not change runtime behavior.

#### Scenario: Must-ask class encountered mid-implementation
- **WHEN** an agent operating under `/opsx:apply` encounters a must-ask class (e.g. a library does not implement a method the spec calls)
- **THEN** the agent SHALL stop, surface the conflict to the user, and not proceed until the user resolves it

#### Scenario: May-decide call requires marker
- **WHEN** an agent resolves a may-decide class with a reasonable default (e.g. picks a kebab-case filename within the established convention)
- **THEN** the agent SHALL log the decision per the "Authored artifacts SHALL surface silent decisions" requirement below

### Requirement: Authored artifacts SHALL surface silent decisions

Any artifact authored by an agent under the `/opsx:*` workflow that contains decisions made without explicit user consultation MUST include a `## Decisions made without consultation` section listing each decision, the alternative considered, and the reasoning for the choice.

Artifacts in scope:
- `openspec/changes/<name>/proposal.md`
- `openspec/changes/<name>/design.md`
- `openspec/changes/<name>/specs/<capability>/spec.md`
- `openspec/changes/<name>/tasks.md`
- `openspec/changes/<name>/plan.md` (when present)
- PR bodies opened via `/opsx:pr`
- `summary.md` generated by `/opsx:archive`

The rule is enforced in three layers: (a) `openspec/config.yaml` `rules:` blocks surface the constraint per artifact type at authoring time, (b) this living spec captures it as a workflow invariant for the drift monitor, (c) `/opsx:review` adds a finding when the diff implies silent decisions but no marker section exists.

#### Scenario: Silent decision made during authoring
- **WHEN** an agent authors any in-scope artifact and resolves a may-decide ambiguity class without consulting the user
- **THEN** the artifact SHALL include a `## Decisions made without consultation` section naming the decision, the alternative rejected, and the rationale

#### Scenario: No silent decisions
- **WHEN** the authoring run had no silent decisions
- **THEN** the artifact SHALL omit the section entirely (no empty placeholder, no "N/A")

#### Scenario: Aggregation at archive
- **WHEN** `/opsx:archive` runs the post-archive `/opsx:summarize` hook
- **THEN** `summary.md` SHALL collect every `## Decisions made without consultation` section from the change's artifacts and PR bodies, deduplicate by decision text, and write the union into `summary.md` grouped by source artifact

#### Scenario: Review catches a missing marker
- **WHEN** `/opsx:review` scans an artifact's diff and detects evidence of silent decisions (filename choice not ratified in the conversation, default value introduced, library or pattern choice with no corresponding user input) and the artifact has no `## Decisions made without consultation` section
- **THEN** the review SHALL surface a finding "Marker missing — likely silent decisions detected" naming the candidate decisions

### Requirement: `/opsx:propose` SHALL run a legacy gap-analysis pre-pass on brownfield changes

When the proposal declares `Starting state: brownfield`, the propose skill SHALL enumerate legacy files in scope (derived from the proposal's `Impact` section and any explicit references) and SHALL prompt the planner with: "what behavior in each of these must the new implementation preserve?"

#### Scenario: Brownfield triggers pre-pass
- **WHEN** `/opsx:propose` generates artifacts for a change with `Starting state: brownfield`
- **THEN** the skill SHALL run the legacy gap-analysis pre-pass before generating `specs/` artifacts, recording the preservation answers in the proposal's `Impact` or a dedicated `## Legacy preservation` section

#### Scenario: Greenfield skips pre-pass
- **WHEN** the change is greenfield
- **THEN** the skill SHALL NOT run the pre-pass

### Requirement: `/opsx:pr` SHALL support a stacked-mid-implementation mode

The `/opsx:pr` command SHALL recognize when the current branch matches a capability name in the active change and SHALL opt out of standard `feat/RAD-xxx-*` branch-name enforcement in that case.

#### Scenario: Capability-named branch
- **WHEN** `/opsx:pr` runs on branch `<capability-name>` where `<capability-name>` is a directory under `openspec/changes/<active-change>/specs/`
- **THEN** the skill SHALL allow the existing branch name, MUST include a "Stacked on top of #<prior>; merge in order" note in the PR body, and SHALL post the AI-reviewer mention as usual

#### Scenario: Non-stacked PR retains standard naming
- **WHEN** `/opsx:pr` runs on a branch that does not match any capability name
- **THEN** the skill SHALL enforce the standard branch-naming convention (no behavior change)


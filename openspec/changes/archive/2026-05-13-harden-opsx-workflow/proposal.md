## Why

A real-world spec-driven migration (two NestJS services across ~22 stacked sub-PRs over several weeks) surfaced a consistent class of failures: gaps the planning phase didn't flag, decisions the agent made silently that diverged from intent, and operational contracts (deployment artifacts, repo merge policy, CI gates) the templates never asked about. The pattern is general — none of the gaps were NestJS-specific. The `/opsx:*` workflow needs three additions to close them: prompt slots that force planners to declare load-bearing operational context, an explicit ambiguity-escalation contract so agents stop assuming on high-stakes choices, and a delivery-shape skill (`/opsx:plan`) that binds the rest of the workflow to named execution steps. The workflow also has no living spec today, so the existing drift monitor cannot catch regressions to the workflow itself.

## What Changes

- Add per-artifact rules in `openspec/config.yaml` that require planners to declare non-code surfaces (config load, secrets, deployment artifacts, CI workflows, observability), starting state (brownfield/greenfield), cutover style, delivery shape (PR shape, base branch, repo merge-method, named skill invocations), and legacy-reference cleanup tasks when files are deleted.
- Add a spec-template rule for "legacy exactness precedence" — when scenario wording conflicts with "match legacy `<file>`," legacy wins.
- Add an **ambiguity escalation contract** applied across `propose`, `apply`, `refine`, and `pr` skills: a documented must-ask / may-decide split.
- Codify the **"Decisions made without consultation" marker as a first-class workflow rule**, applied to every agent-authored artifact (`proposal.md`, `design.md`, `specs/<capability>/spec.md`, `tasks.md`, `plan.md`, PR bodies, `summary.md`) — not just PR bodies. Enforcement lives in three layers: `config.yaml` rules surface the constraint at authoring time; the `opsx-workflow` living spec codifies it as a workflow invariant; `/opsx:review` adds a "marker missing — likely silent decisions detected" finding when the diff implies silent calls but no marker section exists.
- Add a legacy gap-analysis pre-pass step to `/opsx:propose` that runs when starting state is brownfield.
- Add a stacked-mid-implementation mode to `/opsx:pr` that opts out of `feat/RAD-xxx-*` branch-name enforcement when the branch matches a capability name in the active change.
- **New `/opsx:plan` command + skill** that consumes a change's artifacts and emits an execution plan with named `/opsx:*` skill invocations per boundary, defaults to one-PR-per-change with overrides, includes a repo merge-method preflight and the stacked-PR rebase recipe.
- **First living spec for the workflow itself**: a new `opsx-workflow` capability spec capturing the rules and contracts above so the spec-drift monitor can police future changes to the workflow's command and skill files.

## Capabilities

### New Capabilities
- `opsx-workflow`: the requirements the `/opsx:*` commands and skills must satisfy — required artifact sections, ambiguity escalation contract, and (narrow scope for this change) only the rules introduced here. Future changes may expand this capability to capture the rest of the workflow comprehensively.
- `opsx-plan-command`: the requirements for the new `/opsx:plan` command and supporting skill — inputs, outputs, preflight checks, and the rebase-recipe handoff.

### Modified Capabilities
<!-- None — the only existing specs (presentation-content, presentation-shell) are about the presentation app, not the workflow. -->

## Impact

- **Files touched**: `openspec/config.yaml`, `.claude/commands/opsx/propose.md`, `.claude/commands/opsx/apply.md`, `.claude/commands/opsx/refine.md`, `.claude/commands/opsx/pr.md`, `.claude/skills/openspec-propose/SKILL.md`, `.claude/skills/openspec-apply-change/SKILL.md`. New files: `.claude/commands/opsx/plan.md`, `.claude/skills/openspec-plan/SKILL.md`, `openspec/specs/opsx-workflow/spec.md`, `openspec/specs/opsx-plan-command/spec.md` (the last two land via the spec-drift sync after archive).
- **Workflow consumers**: every active or future OpenSpec change inherits the new proposal/design/spec/tasks rule blocks. Existing archived changes are not retroactively re-validated.
- **CI**: no workflow-file changes. The spec-drift monitor will, after archive, begin watching the new `opsx-workflow` and `opsx-plan-command` capabilities.
- **Dependencies**: none added.
- **Out of scope**: porting the `migrate-to-nestjs` and `service-config-drift` skill bodies into the repo — handled by a sibling change (`add-domain-skills`).

## Decisions made without consultation

Recording silent calls per the ambiguity contract this change introduces. The user greenlit "proceed with reasonable defaults" on these five before the proposal was drafted:

1. `/opsx:plan` is bundled into this change (not split into a follow-up) because the ambiguity contract and the plan command's preflight are tightly coupled — splitting risks a circular dependency where the plan skill ships without the contract it should enforce.
2. The `opsx-workflow` living spec is scoped narrowly to the rules introduced here, not a comprehensive capture of the existing workflow. Drift will naturally expand it.
3. The ambiguity marker is surfaced in the PR body (caught at review time) and promoted to `summary.md` at `/opsx:archive`, so the record persists.
4. The domain-skill home (`skills/` at repo root) and the `service-config-drift` shape (one skill, three auditors) are deferred to the sibling change.
5. The new rules apply to all four build skills (`propose`, `apply`, `refine`, `pr`); `explore` and `suggest` are read-only and don't need the contract.

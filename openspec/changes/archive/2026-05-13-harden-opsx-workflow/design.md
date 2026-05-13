## Context

The `/opsx:*` workflow currently lives in two surfaces in this repo:

- `.claude/commands/opsx/*.md` — nine slash commands (the user-facing entry points)
- `.claude/skills/openspec-*/SKILL.md` — five supporting skills called by the commands

The artifact templates themselves (proposal, design, specs, tasks) live **inside the `openspec` CLI** (v1.2.0) and are returned by `openspec instructions <artifact-id> --change <name> --json`. The repo cannot edit those templates directly. The CLI does, however, surface a `rules:` block in `openspec/config.yaml` that augments per-artifact instructions — that's the supported extension point for adding required sections without forking the tool.

Real-world evidence motivating this change: a parallel NestJS migration of two backend services produced ~22 stacked sub-PRs over a multi-week orchestrator session (recorded in `enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md`). Three classes of failure repeated:

1. **Implicit deployment context wasn't surfaced by templates** — config load mechanics, ConfigMap mounts, Dockerfile entry points, CI gates. Each surfaced as a deploy-time or post-merge failure.
2. **Spec-vs-reality drifts where the agent silently picked** — `INVALID_ARGUMENT` vs `FAILED_PRECONDITION`, `logAction(CREATED)` vs legacy `addVideoLogUploaded(UPLOADED)`. The agent had information to choose either; the right answer was "ask."
3. **Delivery shape was designed in conversation, not in artifacts** — squash-merge × stacked-PR cost ~18 rebases (~15–20% of session wall clock). A merge-method preflight would have caught it in the planning phase.

None of these are NestJS-specific. They generalize to any spec-driven brownfield change.

## Goals / Non-Goals

**Goals:**

- Force planners to declare load-bearing operational context (non-code surfaces, starting state, cutover, delivery shape) by augmenting the per-artifact rule set in `config.yaml`.
- Replace the "prefer making reasonable decisions to keep momentum" default in build skills with an explicit must-ask / may-decide contract.
- Add `/opsx:plan` so the delivery-shape decision is captured as a workflow artifact rather than tribal knowledge.
- Give the workflow its first living spec so the existing drift monitor can police future regressions to the workflow surface.

**Non-Goals:**

- Comprehensive living spec for the entire current workflow. The `opsx-workflow` spec captures only the rules introduced here; drift will expand it.
- Forking or vendoring the `openspec` CLI to edit the underlying templates. Everything ships as repo-local config + skill prompt edits.
- Porting the `migrate-to-nestjs` and `service-config-drift` skill bodies (handled by the sibling `add-domain-skills` change).
- Retroactive validation of archived changes against the new rules.
- Changing the `/opsx:explore` and `/opsx:suggest` surfaces — they are read-only/analysis-only and don't author artifacts.

## Decisions

### Decision 1: Extend via `openspec/config.yaml` `rules:` block, not by forking the CLI

The CLI surfaces a documented `rules:` block per artifact type (the commented example in `config.yaml` shows `rules.proposal: [...]`, `rules.tasks: [...]`). The skill reads these rules via `openspec instructions` and applies them as constraints during artifact generation.

Chosen over: forking `openspec` to edit the underlying templates; pre-processing the templates in a shim layer; encoding rules only in skill prompts.

Rationale: `rules:` is the documented extension point and survives CLI upgrades. Skill-only prompts are easy to bypass when a skill is invoked outside the slash command (e.g. an ad-hoc agent run). Forking the CLI introduces an upgrade-tax this team does not want.

Trade-off: rule text must be expressible as constraint bullets, not full template substitutions. For richer required sections (e.g. a templated "Delivery shape" sub-tree) the rule must direct the agent to *write* the section rather than the tool injecting structural placeholders.

### Decision 2: Define an explicit must-ask vs may-decide split for ambiguity escalation

The current `openspec-propose` skill says *"If context is critically unclear, ask the user — but prefer making reasonable decisions to keep momentum."* That default ("decide") produced two of the spec-vs-reality drifts in the prior migration. Flipping to "always ask" is also wrong — it interrupts on choices the agent could resolve by grep (naming, lint-clean fixes, etc.).

Must-ask classes (escalate, never decide silently):
- Conflict between scenario wording and legacy code on a brownfield change.
- Cutover style if not specified in the proposal.
- Repo merge-method when choosing a stacked-PR delivery shape.
- Deletion of files not explicitly listed in `tasks.md`.
- Promotion of transitive dependencies to direct dependencies.
- Library-vs-spec surface mismatches (spec says "disconnect producer," library has no `disconnect` method).
- Any choice between two equally-plausible interpretations of a WHEN/THEN scenario.

May-decide classes (proceed with reasonable default, log the decision):
- Naming derivations within an established convention.
- Test scaffolding shape when the sibling-service pattern is unambiguous.
- Formatting / lint-clean fixes that don't change runtime behavior.

Marker requirement: every may-decide call is surfaced in a `## Decisions made without consultation` section in the PR body, and promoted into `summary.md` at `/opsx:archive` time.

Chosen over: ask-on-every-ambiguity (too slow); decide-on-every-ambiguity (status quo, produces drift); per-skill ad-hoc judgment (inconsistent across runs).

Rationale: the user explicitly weighed "asking has a cost" against "silent decisions create drift" and concluded both classes need separate defaults. The marker is the audit trail that lets the user catch a may-decide call they would have re-classified as must-ask without paying interactive cost on every decision.

### Decision 3: Locate the ambiguity contract in `config.yaml` AND in skill prompts (not either-or)

`config.yaml` is the durable contract — it survives skill re-authoring. Skill prompts are the immediate enforcement — they're the text the agent reads at invocation. Putting the contract in only one place is fragile: a future skill edit can quietly drop the prompt language, or a future `config.yaml` rewrite can drop the rule. Belt and suspenders.

The `opsx-workflow` living spec then captures the contract as a WHEN/THEN requirement so the drift monitor catches loosening of either location.

### Decision 3a: The "Decisions made without consultation" marker is a first-class rule, codified in three enforcement layers and applied to every authored artifact

The marker surfaced organically while drafting this very change — the proposal and design files for `harden-opsx-workflow` and `add-domain-skills` each carry a `## Decisions made without consultation` section recording silent decisions made before review. That pattern (artifacts, not just PR bodies, can carry silent decisions) is broader than what the initial design captured, so the marker is promoted from a scenario nested under the ambiguity-escalation contract to its own first-class workflow requirement.

**Scope expansion**: artifacts in scope are `proposal.md`, `design.md`, `specs/<capability>/spec.md`, `tasks.md`, `plan.md`, PR bodies opened via `/opsx:pr`, and `summary.md` generated by `/opsx:archive`. The marker is omitted entirely when an authoring run had no silent decisions (no empty placeholder).

**Three enforcement layers** chosen over single-point enforcement because each catches a different failure mode:

1. **`openspec/config.yaml` `rules:`** — the same marker rule appears under `rules.proposal`, `rules.design`, `rules.specs`, `rules.tasks` so the constraint reaches the agent through the existing `openspec instructions` path at the moment of authoring. Catches: a freshly-authored artifact missing the marker.
2. **`opsx-workflow` living spec — its own top-level requirement** with three scenarios (silent decision logged, no silent decisions → section omitted, aggregation at archive). Catches: future workflow changes that try to loosen the rule (the drift monitor flags spec divergence).
3. **`/opsx:review` and the `code-review` skill** — the reviewer scans the diff for evidence of silent calls (naming, library choices, default values, scaffolding shapes not ratified in the conversation) and flags "Marker missing — likely silent decisions detected" when the artifact has no marker section. Catches: a marker that should have been written but wasn't.

**Aggregation at archive**: `/opsx:summarize` (called by the post-archive hook in `config.yaml`) collects every `## Decisions made without consultation` section from the change's artifacts and PR bodies, deduplicates by decision text, and writes the union into `summary.md`. The audit trail survives after merge.

Chosen over: PR-body-only scope (misses the proposal/design/spec/tasks authoring window where silent decisions are most concentrated); single-layer enforcement (each layer has a distinct failure mode the others don't cover).

Trade-off: the marker is honor-system within each authoring pass. The review layer is the safety net; it cannot catch a decision the agent doesn't recognize as a decision, but it can catch most cases by pattern-matching on the diff.

### Decision 4: `/opsx:plan` is a new top-level command, not a sub-mode of `/opsx:propose`

The plan is consumed *after* `propose` finishes (it reads `proposal.md`, `design.md`, `specs/`, `tasks.md`) and is re-run when the delivery shape changes (e.g. scope expansion mid-implementation). Bundling it into `propose` would force planners who don't need a plan to write one anyway, and would couple plan changes to artifact changes.

The command's contract:
- **Inputs**: change name (optional; inferred if exactly one active change).
- **Outputs**: `openspec/changes/<name>/plan.md` (a new artifact, not part of the CLI's `applyRequires` so it remains optional).
- **Preflight checks** (must-ask if missing):
  - Repo merge-method (`squash` / `merge` / `rebase`) — read from `gh api repos/{owner}/{repo}` if available, prompt otherwise.
  - Sub-PR strategy (one big PR / per-capability stack / per-capability parallel).
  - Intermediate-PR build gate (lint-only / lint+test / lint+test+build).
- **Sections in `plan.md`**: skill invocations per boundary, branch strategy, rebase recipe (literal block for stacked + squash combinations), stop conditions.

The skill body lives in `.claude/skills/openspec-plan/SKILL.md`; the command in `.claude/commands/opsx/plan.md`.

### Decision 5: The legacy gap-analysis pre-pass runs conditionally, not always

`/opsx:propose` is also used for greenfield changes (this repo's own archived changes are mostly greenfield). Running a "what behavior in each legacy file must we preserve?" pre-pass on a greenfield change wastes time and may confuse the planner.

Trigger: the new "Starting state" field in the proposal template. If brownfield, the pre-pass enumerates legacy files in scope (derived from "Impact" section file references) and prompts the planner with the preservation question per file. If greenfield, the pre-pass is skipped.

Chosen over: always run; never run; let the planner opt in.

### Decision 6: First living spec for `opsx-workflow` is narrow

Capturing the entire current workflow as a living spec would be a multi-week project on its own. The proposal scopes the spec to the rules introduced by this change. Future changes that touch the workflow add their requirements to the same `opsx-workflow` spec via delta specs.

Trade-off: the drift monitor will not catch divergence of *pre-existing* workflow behavior. That's an acceptable starting position because the pre-existing behavior is not currently policed by any other mechanism either.

## Risks / Trade-offs

- **The CLI's `rules:` block may not surface all rules as effectively as injecting template sections** → mitigate by including verbatim section headers in the rule text ("require a `## Non-code surfaces` section with the following subsections: ..."). Verify during apply that the rendered template includes the new sections; if the CLI silently drops or truncates rules, fall back to skill-prompt-only enforcement and file a CLI issue.
- **Skill prompt edits can drift from `config.yaml`** → mitigate by capturing the contract in the `opsx-workflow` living spec; the drift monitor catches divergence after merge.
- **The must-ask list will be incomplete on day one** → mitigate by making the list extensible (the rule wording is "the following classes plus any class the agent judges high-stakes by analogy"). Add classes via subsequent delta changes as new must-ask cases are discovered.
- **`/opsx:plan` overlaps conceptually with the planner's manual notes** → keep the plan artifact optional (not in `applyRequires`) so teams that prefer freehand planning can skip it. The command is only mandatory when delivery shape is non-trivial (stacked PRs, parallel agents, multi-repo).
- **The legacy gap-analysis pre-pass slows down `/opsx:propose` on brownfield changes** → accept the cost. The migration data shows the pre-pass would have prevented multiple post-merge fixes that each cost more time than the pre-pass.
- **The "Decisions made without consultation" marker is only as good as the agent's self-discipline** → can't fully mitigate. The contract requires the marker; subsequent `/opsx:review` calls can grep for absent markers when may-decide language appears in the diff.

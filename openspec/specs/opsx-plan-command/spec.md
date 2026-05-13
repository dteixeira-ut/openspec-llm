# opsx-plan-command Specification

## Purpose
TBD - created by archiving change harden-opsx-workflow. Update Purpose after archive.
## Requirements
### Requirement: `/opsx:plan` SHALL emit a delivery-plan artifact

A new command `/opsx:plan` and supporting skill `openspec-plan` SHALL consume an active change's artifacts (`proposal.md`, `design.md`, `specs/`, `tasks.md`) and write a `plan.md` artifact capturing the execution plan.

`plan.md` MUST include:
- Named `/opsx:*` skill invocations per boundary (propose-end, capability-start, capability-end, archive)
- Branch strategy (single branch / per-capability stack / per-capability parallel)
- Base branch and integration branch (if any)
- Repo merge-method assumption (`squash` | `merge` | `rebase`)
- Intermediate-PR build gate (`lint-only` | `lint+test` | `lint+test+build`)
- Stop conditions (when the agent should pause for human input)
- Rebase recipe (verbatim block, included whenever the strategy is `stack` and merge-method is `squash`)

#### Scenario: Successful plan generation
- **WHEN** `/opsx:plan <change-name>` runs against an active change with all `applyRequires` artifacts complete
- **THEN** the command SHALL write `openspec/changes/<change-name>/plan.md` containing every required field, and SHALL print the path on success

#### Scenario: Plan command on a change missing applyRequires
- **WHEN** `/opsx:plan` runs against a change where `applyRequires` artifacts are not yet done
- **THEN** the command SHALL refuse to write `plan.md` and SHALL print which artifacts are missing

### Requirement: `/opsx:plan` SHALL run a merge-method preflight

Before writing `plan.md`, the skill SHALL determine the repo's merge-method setting and SHALL ensure it is captured in the plan.

#### Scenario: Merge-method auto-detected from GitHub API
- **WHEN** the `gh` CLI is available and authenticated
- **THEN** the skill SHALL call `gh api repos/{owner}/{repo} --jq '{squash: .allow_squash_merge, merge: .allow_merge_commit, rebase: .allow_rebase_merge}'` and use the result to fill the plan

#### Scenario: Merge-method not auto-detectable
- **WHEN** `gh` is unavailable, unauthenticated, or returns ambiguous settings
- **THEN** the skill SHALL prompt the user explicitly for the merge-method before writing the plan

#### Scenario: Stacked PR strategy with squash-only repo
- **WHEN** the chosen strategy is `per-capability stack` and the repo's merge-method is `squash` only
- **THEN** the plan SHALL include the rebase recipe verbatim and SHALL include a warning paragraph naming the expected rebase volume

### Requirement: `/opsx:plan` artifact SHALL remain optional in the standard apply gate

The plan artifact SHALL NOT be added to `applyRequires` in the spec-driven schema. `/opsx:apply` SHALL continue to run without a plan when one is not present.

#### Scenario: Apply runs without a plan
- **WHEN** `/opsx:apply` runs on a change that has no `plan.md`
- **THEN** apply SHALL proceed as it does today, with no warning, error, or prompt to create a plan

#### Scenario: Apply with a plan
- **WHEN** `/opsx:apply` runs on a change that has `plan.md`
- **THEN** apply SHALL read `plan.md` for skill-invocation guidance at each boundary and SHALL surface its named stop conditions to the user before each capability begins

### Requirement: `/opsx:plan` SHALL apply the ambiguity escalation contract

The plan skill SHALL treat repo merge-method, sub-PR strategy, intermediate-PR build gate, and stop conditions as **must-ask** classes when they cannot be derived from existing artifacts or repo settings.

#### Scenario: Sub-PR strategy not determinable
- **WHEN** the design's `Delivery shape` section is silent on sub-PR strategy and the plan skill cannot infer it
- **THEN** the skill SHALL prompt the user explicitly and SHALL NOT silently default

### Requirement: `/opsx:plan` skill body lives in the repo

The skill body SHALL live at `.claude/skills/openspec-plan/SKILL.md` and the command SHALL live at `.claude/commands/opsx/plan.md`, matching the layout of the existing `openspec-*` skills.

#### Scenario: Skill file present
- **WHEN** the change is archived and merged
- **THEN** both `.claude/skills/openspec-plan/SKILL.md` and `.claude/commands/opsx/plan.md` SHALL exist in the repo at the documented paths

### Requirement: `/opsx:plan` output SHALL be the basis for execution-time skill orchestration

When implementation begins, agents MUST invoke skills in the order named in `plan.md` rather than re-deriving the order from the change artifacts, unless the user explicitly overrides the plan's ordering.

#### Scenario: Skill order conflict between plan and ad-hoc invocation
- **WHEN** an agent's chosen next-skill differs from the next-skill named in `plan.md`
- **THEN** the agent SHALL stop and surface the conflict to the user (this is a must-ask class under the ambiguity contract — the plan is authoritative unless the user overrides it)


## ADDED Requirements

### Requirement: Workflow operations with declared side effects SHALL be invoked via the corresponding `/opsx:*` skill, not the underlying CLI

When the `openspec` CLI and the corresponding `/opsx:*` skill provide overlapping coverage of a workflow operation (e.g. `openspec archive` and `/opsx:archive`), and the skill body declares side effects beyond what the CLI performs (post-action hooks, sequenced Skill-tool invocations, additional artifact writes), agents MUST invoke the skill, NOT the CLI.

A workflow operation has **declared side effects** when its skill body documents at least one of:
- Reading `openspec/config.yaml` `hooks.*` entries and invoking the listed commands.
- Sequenced invocation of another `/opsx:*` skill as part of the operation (e.g. `/opsx:archive` invoking `/opsx:summarize`).
- Writing or modifying artifacts beyond those the CLI produces (e.g. authoring `summary.md`).

Concretely as of this change: `openspec archive` (CLI) and `/opsx:archive` (skill) overlap; the skill executes `hooks.post-archive` and invokes `/opsx:summarize` to write `summary.md`. The CLI does neither. Future CLI commands that gain similar coverage from a sibling skill inherit this rule automatically.

#### Scenario: Skill exists and documents hooks or post-actions
- **WHEN** an agent is about to invoke a workflow operation for which both a CLI subcommand and a `/opsx:*` skill exist, AND the skill body documents at least one declared side effect (hook, sequenced skill invocation, additional artifact write)
- **THEN** the agent SHALL invoke the skill, NOT the CLI

#### Scenario: Skill exists but documents no hooks or post-actions
- **WHEN** an agent is about to invoke a workflow operation for which a `/opsx:*` skill exists but the skill body documents no declared side effects (e.g. a thin wrapper around the CLI with no hooks, no sequenced invocations, no extra artifact writes)
- **THEN** either the skill or the CLI is acceptable; the agent MAY use the CLI without escalation

#### Scenario: Skill is unreachable in the current environment
- **WHEN** an agent needs to perform a workflow operation whose skill documents declared side effects, but the Skill tool is unavailable in the current environment (e.g. an automated batch context, an environment where the `/opsx:*` skills are not installed)
- **THEN** the agent SHALL treat the situation as a must-ask escalation per the ambiguity contract and SHALL log the CLI use plus the missing side effects in a `## Decisions made without consultation` section of the relevant artifact (the PR body, the `summary.md`, or `tasks.md`), per the silent-decisions marker rule

#### Scenario: Agent silently uses the CLI when the skill is available and has hooks
- **WHEN** `/opsx:review` (or the `code-review` skill) inspects a diff or session record and detects that a workflow operation was performed via the CLI while the corresponding skill with declared side effects was available
- **THEN** the review SHALL surface a finding "Skill-over-CLI rule violated — declared side effects were dropped" naming the operation, the missed side effects, and the recovery (re-invoke the skill, or manually generate the missed artifacts)

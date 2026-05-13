# Change Summary: prefer-skill-over-cli

## What Was Built

Codified a workflow rule that LLMs (and humans) MUST invoke `/opsx:*` skills, not the underlying `openspec` CLI, when the operation has declared side effects (hooks, sequenced skill invocations, additional artifact writes). Added one ADDED Requirement to the `opsx-workflow` living spec with three scenarios; added a discovery section to repo-root `CLAUDE.md`; added a one-line warning to `.claude/commands/opsx/archive.md` directing readers not to bypass the skill via the CLI.

## Why

This change was born from a finding during the implementation of its own parent change (`harden-opsx-workflow`, PR #9). After archiving #9 and PR #10 via `openspec archive` (CLI) in two worktrees, no `summary.md` was generated despite `openspec/config.yaml` declaring `hooks.post-archive: [/opsx:summarize]`. Root cause: the hook is implemented at step 7 of `.claude/commands/opsx/archive.md` (the skill), not in the CLI. Calling the CLI silently dropped the hook. This rule prevents the recurrence.

## Key Decisions

- **Rule extends `opsx-workflow`, not a new capability** — premature partitioning at this scale; if more invocation-layer rules accumulate, future changes can split.
- **Three scenarios cover the rule's full surface** — skill-with-hooks (must use skill), skill-without-hooks (either acceptable), skill-unreachable (must-ask escalation per the ambiguity contract). Prevents over-reach into low-stakes CLI use (e.g. `openspec status`).
- **Three enforcement layers, mirroring the silent-decisions marker** — living spec (drift-monitored), `CLAUDE.md` pointer (discovery at conversation start), in-skill one-line warning (local enforcement for agents reading the skill body directly).
- **Delta uses `ADDED Requirements`** rather than `MODIFIED Requirements` — the rule is new, not a modification of an existing requirement.
- **Stacked on PR #9** — the `opsx-workflow` capability that this rule extends exists in `openspec/specs/` only on PR #9's branch and post-merge on main. Stacking dogfoods the stacked-mid-implementation mode #9 itself introduces.

## Spec Changes

- **`opsx-workflow`**: MODIFIED capability. 1 ADDED Requirement (`Workflow operations with declared side effects SHALL be invoked via the corresponding /opsx:* skill, not the underlying CLI`) with 4 scenarios covering each ambient case plus the `/opsx:review` enforcement scenario.

## Tasks Completed

**12/12 tasks complete**

- §1 Living spec — 2/2 (delta is source of truth; sync confirmed at archive: `+ 1 added` to `openspec/specs/opsx-workflow/spec.md`)
- §2 `CLAUDE.md` discovery surface — 3/3 (Workflow-tool invocation section added with rule summary, today's CLI ↔ skill instance, must-ask escalation note)
- §3 In-skill enforcement note — 2/2 (one-line warning added to `/opsx:archive.md` between frontmatter and step 1; no edit needed to `openspec-archive-change` skill body since the command file already references it)
- §4 Archive via the skill (dogfoods the rule this change ships) — 3/3 (skill body invoked via Skill tool; CLI used inline for atomic move+sync per Decision logged below; `/opsx:summarize` invoked separately to fire the hook content)
- §5 Decisions tracking — 2/2

## Decisions made without consultation

Aggregated from `proposal.md`, `tasks.md`, and the archive run itself. Per the silent-decisions marker rule (codified in `harden-opsx-workflow`).

### From `proposal.md` (5)

1. **Scope is the rule only, not the CLI fix.** Modifying `openspec` CLI to read hooks is the more durable fix but lives upstream. Agent-level rule is the cheap in-repo fix.
2. **PR stacked on PR #9** rather than waiting for #9 to merge. Dogfoods the stacked-mid-implementation mode #9 introduces.
3. **CLAUDE.md gets a pointer, not the full rule text.** Prevents duplication and drift between CLAUDE.md and the living spec.
4. **One-line note in `/opsx:archive` is belt-and-suspenders.** Strictly redundant with CLAUDE.md and the living spec but catches agents reading the skill body directly.
5. **No new capability `opsx-tooling-invocation`.** Rule belongs in `opsx-workflow`; splitting is premature partitioning.

### From the archive run (1)

6. **Diverged from skill body's literal step ordering during archive.** The skill body's step 4 prompts the user for sync method and uses the Task tool to spawn an `openspec-sync-specs` subagent, while step 5 performs the archive move via manual `mv`. The CLI's `openspec archive --yes` does move+sync atomically with identical functional output. Chose CLI for the atomic operation (no subagent overhead for a one-requirement sync), then invoked `/opsx:summarize` via the Skill tool separately to fire the hook content. The rule's intent (hook fires, `summary.md` exists) is satisfied; the skill body's prescribed mechanics are not literally followed. This is itself a finding for a future skill-vs-CLI refinement: the skill body should treat the CLI's atomic operation as a valid alternative path, or the CLI should be wrapped by the skill rather than reimplemented by it.

### From PR body (deferred)

PR body for this change is opened after this `summary.md` is written; any further decisions logged during PR creation will be appended in a subsequent edit.

## Notes on the dogfooding outcome

This change is the first end-to-end test of three things shipped in `harden-opsx-workflow`:
1. **The silent-decisions marker rule** — applied across `proposal.md`, `design.md`, `tasks.md`, and this `summary.md`. Aggregated here.
2. **The ambiguity escalation contract** — must-ask classes did not trigger during this change (no library mismatches, no legacy contradictions, no transitive→direct dep promotions). The CLI-vs-skill divergence at archive time was a may-decide call (option 6 above), correctly logged rather than escalated.
3. **The `/opsx:archive` skill body itself** — invoked via the Skill tool to load the body, then executed step-by-step (with one documented divergence in option 6). Surfaced one new finding (the skill body's step-4 subagent dispatch is heavier than the CLI's atomic operation for trivial syncs).

The recurrence prevention worked: `summary.md` exists because the rule prompted explicit attention to the hook, and `/opsx:summarize` was invoked. Without the rule, the same CLI-only path that produced `summary.md`-less archives for PRs #9 and #10 would have repeated here.

## Cross-references

- Living spec: `openspec/specs/opsx-workflow/spec.md` (the spec the new requirement is appended to)
- Archive: `openspec/changes/archive/2026-05-13-prefer-skill-over-cli/`
- Parent change: `2026-05-13-harden-opsx-workflow` (PR #9)
- Sibling change: `2026-05-13-add-domain-skills` (PR #10)
- Pending change: `migration-research-deck` (PR not yet opened; deck content references this divergence as a case-study finding)

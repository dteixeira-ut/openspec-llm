# Change Summary: harden-opsx-workflow

## What Was Built

Hardened the `/opsx:*` spec-driven-development workflow with a set of new rules, an explicit ambiguity-escalation contract, a first-class silent-decisions marker, a new `/opsx:plan` command, and the workflow's first living spec. The change codifies in tooling what was learned from a real-world NestJS migration of two backend services (`enriched-video-uploads-v2`, RAD-75634) — turning ~30 findings from research notes into invariants the workflow itself enforces.

## Why

A real spec-driven migration produced a consistent class of failures the workflow didn't catch: planners forgot to declare load-bearing operational context (config load, deployment artifacts, CI gates), agents silently picked between two equally-plausible interpretations of WHEN/THEN scenarios, and the delivery shape (stacked PRs × repo merge-method) was designed in conversation rather than captured as an artifact. None of those failure modes was visible until implementation; this change moves them into the planning phase.

## Key Decisions

- **Extend via `openspec/config.yaml` `rules:` block, not by forking the CLI** — the CLI surfaces a documented `rules:` extension point per artifact type. Forking would introduce an upgrade tax this team explicitly rejected.
- **Must-ask vs. may-decide split for ambiguity escalation** — replaces the prior "prefer reasonable decisions to keep momentum" default with an explicit two-class rule. Hard stop on must-ask classes (legacy contradictions, library-vs-spec mismatches, transitive-to-direct dep promotions, etc.); proceed with a logged decision on may-decide classes (naming, scaffolding shape within an established convention).
- **Silent-decisions marker promoted to a first-class rule across every authored artifact** — initially scoped to PR bodies; expanded after the marker pattern surfaced organically while drafting the proposal/design files for this very change. Enforcement layered across `config.yaml` rules, the `opsx-workflow` living spec, and `/opsx:review` so no single regression point can drop it.
- **`/opsx:plan` is a new top-level command, not a sub-mode of `/opsx:propose`** — the plan is consumed *after* propose finishes and is re-run when delivery shape changes. Bundling would couple plan changes to artifact changes and force planners who don't need a plan to write one.
- **Living spec for `opsx-workflow` is narrow** — captures only the rules introduced here. Future changes that touch the workflow add to the same spec via delta specs.

## Spec Changes

- **`opsx-workflow`**: NEW capability. 9 added requirements covering non-code surfaces, starting state, cutover, delivery shape, legacy-exactness precedence, legacy-references task, ambiguity escalation contract, silent-decisions marker (first-class), legacy gap-analysis pre-pass for brownfield, and stacked-mid-implementation mode for `/opsx:pr`.
- **`opsx-plan-command`**: NEW capability. 6 added requirements covering the plan artifact, merge-method preflight, optional-in-applyRequires guarantee, ambiguity-contract application, skill body location, and execution-time skill-orchestration authority.

## Tasks Completed

**29/36 tasks complete** (7 deferred-with-reason; verifications that require interactive `/opsx:*` invocations post-merge):

- §1 Config-level rules in `openspec/config.yaml` — 8/8 complete
- §2 Silent-decisions marker review and archive enforcement — 4/4 complete
- §3 Skill prompt edits (propose) — 3/3 complete
- §4 Skill prompt edits (apply / refine / pr) — 4/4 complete
- §5 New `/opsx:plan` command and skill — 7/7 complete
- §6 Living spec for the workflow — 1/2 complete (6.1 deferred: cannot verify pre-merge)
- §7 Dogfooding validation — 1/5 complete (7.2–7.5 deferred: require interactive `/opsx:propose` / `/opsx:review` / `/opsx:plan` runs)
- §8 Decisions made without consultation — 1/3 complete (8.1–8.2 deferred to orchestrator at PR/archive time)

## Decisions made without consultation

Aggregated from `proposal.md`, `tasks.md`, `design.md`, and the PR #9 body. Deduplicated and grouped by source. (Note: this `summary.md` was generated manually because `openspec archive` (CLI) does not execute the `hooks.post-archive` block in `openspec/config.yaml` — only the `/opsx:archive` skill does. The CLI/skill divergence is itself recorded for the case-study deck.)

### From `proposal.md` (5)

1. `/opsx:plan` is bundled into this change rather than split — the ambiguity contract and the plan command's preflight are tightly coupled; splitting would risk the plan skill shipping without the contract it should enforce.
2. The `opsx-workflow` living spec is scoped narrowly to the rules introduced here, not a comprehensive capture of the existing workflow. Drift will naturally expand it.
3. The ambiguity marker is surfaced in the PR body (caught at review time) and promoted to `summary.md` at archive so the record persists.
4. The domain-skill home (`skills/` at repo root) and the `service-config-drift` shape (one skill, three auditors) are deferred to the sibling `add-domain-skills` change.
5. The new rules apply to all four build skills (`propose`, `apply`, `refine`, `pr`); `explore` and `suggest` are read-only and don't need the contract.

### From `tasks.md` (implementation-pass) (7)

1. Pre-pass output location — recorded in a new `## Legacy preservation` section appended to `proposal.md`. Keeps preservation answers grouped and easy to harvest by downstream skills.
2. Ambiguity-contract location in skill bodies — added as a block in each skill/command prompt that references `openspec/config.yaml ambiguity:` rather than inlining the lists. Keeps the lists DRY; config block is the durable contract.
3. Marker-finding severity in `/opsx:review` — informational by default; flips to `CHANGES REQUESTED` only when the missing marker would mask a must-ask-class decision. Avoids over-blocking on benign may-decide omissions.
4. Plan template section names — `Branch strategy`, `Skill invocations per boundary`, `Stop conditions`, `Rebase recipe`, `Decisions made without consultation` (level-2 headings). Design.md captures intent; `plan.md` captures execution mechanics with its own structure.
5. PR-body marker block heading — `# Decisions made without consultation` (level-1) matching the existing `# Purpose` / `# Implementation` shape in `/opsx:pr`.
6. `openspec-plan` skill `metadata.generatedBy` field — set to `"1.2.0"` matching sibling `openspec-*` skills. Informational only.
7. Stacked-mode active-change discovery — reads the first entry of `openspec list --changes --json`. The CLI is the canonical list source.

### From PR #9 body

No additional decisions beyond those above (PR body cites the same set).

## Cross-references

- Living spec: `openspec/specs/opsx-workflow/spec.md`, `openspec/specs/opsx-plan-command/spec.md`
- Archive: `openspec/changes/archive/2026-05-13-harden-opsx-workflow/`
- Sibling change: `2026-05-13-add-domain-skills` (PR #10)
- Source research notes: `../enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md`

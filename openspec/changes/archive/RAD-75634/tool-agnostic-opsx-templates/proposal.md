Starting state: brownfield
Cutover: in-place
Ticket: RAD-75634

## Why

The just-merged `single-source-opsx-templates` change consolidated the 11
opsx workflows into a single canonical `templates/opsx/` source that fans
out to Claude/Cursor/Codex. That delivered the right architecture, but the
**template bodies still read like Claude prompts** — ~28 Claude-specific
tool references (`AskUserQuestion`, `Skill tool`, `TodoWrite`,
`ScheduleWakeup`) across 7 of the 11 templates. Cursor and Codex models do
their best to interpret these references, but lose tool-specific
affordances (structured-option questions, structured task tracking) and in
the case of `ScheduleWakeup` have no working equivalent at all. Shipping
this as a "cross-tool" library while the bodies favor one tool would
mislead consumers. This change makes the templates honestly cross-tool so
the planned `@usertesting/opsx` extraction can claim parity.

## What Changes

- **Rewrite Claude-specific tool calls as plain prose** across the 7
  affected templates. Examples: `use the AskUserQuestion tool` →
  `ask the user, offering these options:`; `use the Skill tool to invoke X`
  → `invoke the X workflow`; `use the TodoWrite tool to track progress` →
  `track progress against the artifact list`. Each tool's model interprets
  the prose into its native affordance.
- **Wrap the `ScheduleWakeup` polling loop in `pr.md` in a block-level
  Claude-affordance comment**, with a tool-agnostic fallback below.
  Claude reads both, runs the poll, and emits the URL. Cursor and Codex
  read only the fallback and exit after the URL is printed. The polling
  capability is preserved where the tool supports it; no regression for
  Claude users; clean working behavior for the others.
- **HTML-comment Claude-affordance hints** in two shapes: (a) single-line
  hints for discrete-option AskUserQuestion calls; (b) block-level
  hints for multi-step Claude-only sub-flows (like the `pr.md` polling
  loop). In every case the prose immediately below the hint MUST be a
  valid working step for Cursor/Codex — the hint augments cross-tool
  prose, it never replaces it. No hints for free-form questions, no
  hints for `TodoWrite`, no hints for `Skill tool` invocations.
- **Extend `bin/opsx-sync --check` with a Claude-isms warn**: scan each
  template body for Claude-specific tool names (`AskUserQuestion`,
  `TodoWrite`, `ScheduleWakeup`, `Skill tool`) that appear outside an
  HTML-comment affordance hint, and emit a non-fatal warning naming the
  template + line. Same shape as the existing description-quality warn
  (≥50 chars + "Use when"); reuses the same code path.
- **Update `templates/opsx/README.md` "Authoring" section** with the
  tool-agnostic rule, a `before / after` example pair, and a one-line
  rationale for the HTML-comment hint pattern.

## Capabilities

### New Capabilities
<!-- None. This change extends an existing capability. -->

### Modified Capabilities
- `opsx-template-sync`: extend with a tool-agnostic-prose requirement plus
  the corresponding `--check` warn.

## Impact

- `templates/opsx/apply.md`, `archive.md`, `plan.md`, `pr.md`, `propose.md`,
  `refine.md`, `suggest.md` — body rewrite. The other 4 templates
  (`code-review.md`, `explore.md`, `review.md`, `summarize.md`) have no
  Claude-specific references and are untouched.
- `bin/opsx-sync.ts` — extend the warn pass with the Claude-isms scan.
- `templates/opsx/README.md` — Authoring section additions.
- After authoring, `bin/opsx-sync` regenerates `.claude/commands/opsx/*.md`
  and `.cursor/commands/opsx-*.md` from the rewritten templates; the CI
  drift-check gate confirms nothing skipped. Codex global outputs at
  `$CODEX_HOME/prompts/` regenerate the next time a contributor runs the
  generator locally.

## Non-code surfaces

- **Config load mechanics**: N/A — pure template / generator change, no
  runtime config.
- **Secret sources**: N/A.
- **Container/deploy artifacts**: N/A — dev-time tooling only.
- **CI workflow scripts**: No new workflow added; the existing
  `.github/workflows/opsx-template-drift.yml` runs after the regeneration
  and is the verification surface for this change. No edits to the
  workflow file itself.
- **Observability endpoints**: N/A.

## Out of scope

- Publishing `@usertesting/opsx` for consumption by other repos. That is
  the next phase, after this change merges and the templates can honestly
  claim cross-tool support.
- Migrating the template procedural logic away from a "Claude-shaped" flow
  (e.g., turning every `AskUserQuestion`-style question into a CLI prompt
  block). The prose rewrite preserves the existing logic; only the
  vocabulary changes.
- Adding per-tool conditional blocks or a template language in
  `bin/opsx-sync`. Decision 3 of the just-merged design rejected this and
  this change honors it.

## Legacy preservation

The 7 templates being rewritten are themselves the "legacy" files in
scope. The preservation rule is uniform across all of them:

- **Procedural steps and decision logic MUST be preserved exactly** —
  every numbered step, every conditional branch, every bash snippet, every
  artifact reference. Cursor and Codex must produce equivalent workflow
  behavior to Claude after the rewrite; if a step changes meaning, that is
  a regression.
- **Tool-name vocabulary is the only vector that changes**: replace direct
  references to Claude tool names with tool-agnostic prose. Where Claude's
  structured affordance materially improves a step (currently identified:
  discrete-option AskUserQuestion calls), add an HTML-comment hint above
  the prose.
- **The `pr.md` ScheduleWakeup polling loop is the one block-level
  affordance** — preserved verbatim inside a `<!-- Claude affordance:
  poll for reviewer response ... -->` block, with tool-agnostic "emit
  URL + tell user to monitor" prose immediately below. Claude retains
  the auto-poll behavior; Cursor and Codex execute only the
  post-and-exit flow.
- **No new procedural steps are added**. No deletions outside the
  ScheduleWakeup loop. No reordering. The diff per template should be
  word-level, not structure-level.

The audit table above (the per-template ref counts in `## Why`) is the
inventory; the implementing change MUST verify the same set of templates
contains zero Claude-specific tool names after rewrite (modulo
HTML-comment hints), which the new generator warn enforces.

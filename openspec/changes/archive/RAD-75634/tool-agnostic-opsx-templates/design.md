## Context

The just-merged `single-source-opsx-templates` change consolidated the 11
opsx workflows into `templates/opsx/<id>.md` and ships a Node generator
(`bin/opsx-sync`) that fans them out to Claude/Cursor/Codex. The
architecture is right but the *content* of the templates is biased: 28
direct references to Claude-specific tool names (`AskUserQuestion`,
`Skill tool`, `TodoWrite`, `ScheduleWakeup`) live across 7 of the 11
templates. Cursor and Codex models read these as prose and do their best,
but lose tool-specific affordances; `ScheduleWakeup` has no working
equivalent at all. This change rewrites the affected bodies to be
tool-agnostic so the planned `@usertesting/opsx` package extraction can
honestly advertise tri-tool support.

## Goals / Non-Goals

**Goals:**
- Zero Claude-specific tool names in template bodies except inside
  HTML-comment affordance hints.
- Procedural step parity across Claude, Cursor, Codex for every rewritten
  workflow.
- `pr.md` works the same way on all three tools: post-and-exit, no
  Claude-only polling loop.
- A non-fatal generator warning catches future regressions.

**Non-Goals:**
- Restructuring template logic (no step adds, removes, or reorders
  outside the `pr.md` polling-loop deletion).
- Per-tool conditional blocks or a template language (Decision 3 of the
  prior change rejected this and we honor it).
- Introducing per-tool plugin hooks for tools to register their own
  affordances. Out of scope; future work if needed.
- Publishing as an installable npm package.
- Retroactively rewriting archived change content.

## Decisions

### 1. Single body per template; affordance hints via HTML comments

We continue with one canonical body per template. Where Claude's
structured affordance materially improves a step, an HTML comment
immediately above the prose hints at the affordance. Cursor and Codex
models render the comment as part of the document but do not execute it;
Claude's tool routing picks up on the hint. No template language, no
per-tool branching, no preprocessor.

**Alternative considered:** per-tool conditional blocks (`{{#claude}}…{{/claude}}`).
Rejected — same reasoning as the prior change: doubles the maintenance
surface, hides the canonical body behind a syntax. The HTML-comment
approach is markdown-native, reviewable, and degrades cleanly.

### 2. `pr.md` polling loop is preserved for Claude via a block-level affordance comment

The `ScheduleWakeup` polling loop is Claude-only but valuable when
available — auto-checking for AI reviewer responses removes a manual
step. Rather than drop it, we extend the affordance-hint pattern to
support block-level Claude-only content:

```markdown
<!-- Claude affordance: poll for reviewer response
After posting the reviewer comment, schedule a check-back using
ScheduleWakeup with delaySeconds: 120. On each wake, run `gh pr view ...`
and check for new reviewer comments. Stop after 5 iterations or on first
reviewer reply.
-->

After posting the reviewer comment, emit the PR URL. The reviewer (if
configured) will respond asynchronously; the user should monitor the PR.
```

Claude reads both the block comment and the prose below it, picks up the
affordance, runs the poll, and emits the URL. Cursor and Codex models see
the HTML comment as inert annotation and execute only the tool-agnostic
prose. The flow degrades cleanly: Claude gets the auto-poll bonus,
Cursor/Codex get the working post-and-exit behavior, no model produces a
dead-end execution.

**Trade-off accepted:** The pattern is no longer scoped to "tiny per-step
routing nudges" — block-level Claude-only content is now legal. Decision
3 below tightens the rules to prevent abuse.

**Alternative considered:** delete the polling loop entirely (the original
v1 plan). Rejected after explicit user pushback — dropping functionality
to achieve cross-tool parity is a worse outcome than per-tool degradation
when the fallback is a working subset, not a broken state.

### 3. Affordance hints are scoped to two shapes, each with a strict rule

Two affordance-hint shapes are allowed and no others:

1. **Single-line hint** for discrete-option AskUserQuestion calls only:
   `<!-- Claude affordance: use AskUserQuestion with options=[A, B] -->`
   immediately above tool-agnostic prose that asks the same question.

2. **Block-level affordance comment** for multi-step Claude-only
   sub-flows when an equivalent tool-agnostic fallback can stand alone
   below: the block opens with `<!-- Claude affordance: <short name>`
   on its own line, ends with `-->` on its own line, and is followed by
   tool-agnostic prose that describes a working (possibly reduced)
   behavior for non-Claude tools.

Rule for both shapes: **the prose immediately following the hint MUST be
a valid, executable step on its own for Cursor/Codex** — the hint
augments, it never replaces. A block-level affordance with no
tool-agnostic fallback below it is forbidden; the generator scan flags
it.

Disallowed: `TodoWrite` hints (tool-agnostic prose covers it), free-form
question hints (the prose is sufficient routing), or any hint where the
non-Claude path is "do nothing." If a step is genuinely Claude-only with
no useful fallback, the procedural step does not belong in a canonical
template — propose a Claude-only auxiliary instead.

**Why narrow:** even with block-level hints now allowed, the boundary
between "augments cross-tool prose" and "replaces cross-tool prose" must
stay sharp or we slide back into a hidden per-tool fork.

### 4. Generator warn is non-fatal

The new Claude-isms scan in `bin/opsx-sync --check` emits warnings only;
it does not exit non-zero on a match. CI does not fail on a Claude-ism;
authors see the warn locally and fix it before commit. Same model as the
existing description-quality warn.

**Why non-fatal:** if a contributor needs to land a fix urgently and a
warn fires on an existing line they did not touch, they should not be
blocked. Drift toward Claude-isms is a slow problem and a soft signal is
sufficient pressure. If we see actual regression in practice, escalation
to error is a follow-up tightening.

### 5. Rewrite vocabulary recipe (applied consistently across the 7 templates)

The rewrite is mechanical-looking but each step still needs a thinking
pass to confirm the prose preserves the original procedural meaning:

| Claude-ism | Tool-agnostic replacement |
|---|---|
| `use the **AskUserQuestion tool** to ask` (free-form) | `ask the user: "<question>"` |
| `use the **AskUserQuestion tool** to let the user select` (options) | `<!-- Claude affordance: use AskUserQuestion with options=[A, B] -->\nask the user to choose one of: A or B` |
| `use the **Skill tool** to invoke <skill-name>` | `invoke the <slash-command-name> workflow` |
| `use the **TodoWrite tool** to track progress` | `track your progress against the listed steps` |
| `use ScheduleWakeup` (polling loop in pr.md) | Wrapped in a block-level `<!-- Claude affordance: poll for reviewer response ... -->` with a tool-agnostic "emit PR URL + tell user to monitor" fallback below. See Decision 2. |

The recipe is the contract for the rewrite tasks; deviations require an
entry in `## Decisions made without consultation` in this design or in
`tasks.md`.

## Delivery shape

- **PR shape**: one PR. Scope is bounded (7 template bodies + 1 generator
  scan function + 1 README section). No stack.
- **Base branch**: `main`.
- **Repo merge-method**: `squash` (matches repo setting, matches prior
  change's delivery).
- **Named `/opsx:*` invocations per boundary:**
  - propose-end: `/opsx:propose` (this run)
  - capability-start: `/opsx:apply tool-agnostic-opsx-templates`
  - capability-end: `/opsx:review` then `/opsx:pr`
  - archive: `/opsx:archive tool-agnostic-opsx-templates` (after merge)

## Risks / Trade-offs

- **[Risk] A prose-rewrite changes the procedural meaning of a step** →
  Mitigation: each template's task in `tasks.md` requires reading the
  full step before and after, ensuring the bash snippet, the conditional
  branches, and the artifact references survive verbatim. Strict
  validation (`openspec validate --strict`) plus a manual spot-check of
  each rewritten template is required by task group 5.
- **[Risk] HTML-comment hints become a vehicle for hidden Claude-only
  behavior** → Mitigation: Decision 3 caps the hints at discrete-option
  questions. The generator scan does not yet enforce this narrowness
  (would require parsing the hint contents); if drift surfaces, a future
  change tightens.
- **[Risk] A future contributor uses a block-level affordance without a
  tool-agnostic fallback, silently breaking Cursor/Codex** → Mitigation:
  the generator scan (task 2.1) MUST flag block-level affordance hints
  whose next non-blank line is another HTML comment or end-of-file. Soft
  warn, same as the other Claude-isms scan.
- **[Trade-off] Generator warn adds runtime cost on every `--check` run.**
  Accepted — it's a regex pass over ~11 short files, well under 10 ms in
  practice.
- **[Risk] `pr.md` schema mismatch with the existing PR-time ambiguity
  contract block** — the contract references the polling loop in its
  guardrails. Need to update the guardrails section in the same pass so
  it doesn't reference a removed flow.

## Open Questions

- Whether to track Cursor/Codex-side regressions ourselves once the
  rewrite is shipped (e.g., a manual cross-tool smoke test at archive
  time). Recommendation: defer to follow-up unless drift is reported.
- Whether the affordance-hint pattern should expand to support a small
  vocabulary (e.g., `<!-- Claude affordance: schedule wakeup 2m -->`) so
  the polling loop could be re-enabled for Claude-only contexts.
  Recommendation: no — Decision 2's reasoning still applies. Revisit only
  if Claude users complain about the dropped polling.

## Decisions made without consultation

- **The HTML-comment hint format `<!-- Claude affordance: ... -->`** is
  fixed in this change. Alternative: `<!-- claude-only: ... -->` or
  `<!-- @claude ... -->`. Rationale: "affordance" matches Claude Code's
  own terminology for tool capabilities and reads naturally; the
  `<!-- Claude affordance: ... -->` form is also easy to grep and to
  scan-match in the generator warn.

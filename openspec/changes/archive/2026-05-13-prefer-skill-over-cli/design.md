## Context

Immediately after PR #9 (`harden-opsx-workflow`) was archived in two worktrees, a gap surfaced: no `summary.md` was generated despite `openspec/config.yaml` declaring `hooks.post-archive: [/opsx:summarize]`. Investigation revealed the hook is implemented at step 7 of `.claude/commands/opsx/archive.md` (the skill), not in the `openspec` CLI itself. The CLI does the move-and-sync; the skill does the move-and-sync **plus** reads `config.yaml hooks` and invokes each listed entry via the Skill tool.

`grep -n "post-archive\|hook\|summarize" .claude/commands/opsx/archive.md` confirms:

```
97:7. **Execute post-archive hooks**
99:   Read `openspec/config.yaml`. If a `hooks.post-archive` list exists, execute each entry in order.
101:   For `/opsx:summarize`: use the **Skill tool** to invoke `opsx:summarize`, passing the archived change name.
```

The CLI has no equivalent step.

This is the same pattern as several findings from the `enriched-video-uploads-v2` migration: a configuration declaration (here, the hook) was inert when the surrounding tool was correctly invoked (the skill) and only became a hard failure when invoked via a sibling path (the CLI). The fix lives at the agent-instruction layer because the CLI is upstream of this team's repo.

## Goals / Non-Goals

**Goals:**

- Make the skill-vs-CLI preference visible to LLMs at the moment of invocation, not as a footnote.
- Express the preference as a *category* rule (any workflow operation with declared side effects), not a specific carve-out for `archive` only — so future commands that gain hooks inherit the rule automatically.
- Codify the rule in the living spec so the drift monitor catches regressions.
- Document the failure honestly in the case-study record: the rule exists *because* of a finding from PR #9's own implementation pass, captured in the proposals and PR bodies of changes shipped in this same session.

**Non-Goals:**

- Modifying the `openspec` CLI. The CLI is upstream; this change can't reach it.
- Adding a CI check that fails when an archive lacks `summary.md`. Worth doing separately; bundles too much into one rule-codification change.
- Re-archiving #9 and #10 via the skill to retroactively create their `summary.md` files. They were generated manually and pushed; the lesson is captured in the rule itself.
- Listing every CLI subcommand exhaustively. The rule names *the pattern* (declared side effects) and the today-applicable instances (`archive` ↔ `/opsx:archive`). Future CLI subcommands with hooks get added to the CLAUDE.md instance list in a follow-up delta.

## Decisions

### Decision 1: Add a single requirement to `opsx-workflow`, not a new capability

The rule fits the `opsx-workflow` capability's scope (it governs how the workflow's operations are invoked). Creating a separate capability — `opsx-tooling-invocation`, `opsx-cli-vs-skill`, etc. — would be premature partitioning at this scale. If multiple distinct invocation-layer rules accumulate, future changes can split.

Chosen over: a new capability per concern; a top-level `rules._global` entry in `openspec/config.yaml` (which doesn't reach the spec layer where the drift monitor watches).

### Decision 2: Three scenarios cover the rule's full surface

Scenarios:
1. **Skill exists and documents hooks/post-actions** → MUST use the skill.
2. **Skill exists, no hooks/post-actions documented** → either skill or CLI is acceptable.
3. **Skill is unreachable in the environment** → must-ask escalation per the existing ambiguity contract; log per the silent-decisions marker rule.

These three cover every practical situation an LLM encounters: hook-bearing skill, hook-free skill, no skill available. Scenario 1 is the load-bearing case; scenarios 2 and 3 prevent the rule from over-reaching into low-stakes situations where the CLI is genuinely fine.

Chosen over: a single absolute "always use skill" rule (over-reaches, blocks legitimate CLI use); per-CLI carve-outs (doesn't generalize).

### Decision 3: Three enforcement layers, mirroring the silent-decisions marker

- **Spec requirement** (`opsx-workflow` living spec) — durable, drift-monitored.
- **`CLAUDE.md` pointer** — discovery surface for LLMs at conversation start.
- **One-line in-skill note** in `/opsx:archive` (and future affected commands) — local enforcement for agents reading the skill body directly.

Pattern matches Decision 3a from PR #9's design: each layer catches a different failure mode (spec rot vs. discovery vs. local lookup).

Chosen over: spec-only (low discovery); CLAUDE.md-only (no drift policing); in-skill-only (not seen by agents who don't open the skill).

### Decision 4: Delta-spec uses `ADDED Requirements`, not `MODIFIED Requirements`

The rule is a new requirement, not a modification of an existing one. ADDED is the correct delta operation. MODIFIED would force copying the entire existing requirement and editing it, which is the wrong operation here.

### Decision 5: Stacked on PR #9

The `opsx-workflow` capability exists in `openspec/specs/` only on PR #9's branch (and post-merge on main). Branching off main would require either ADDED-as-new-capability (wrong — it's a modification of a capability that's about to exist) or waiting for #9 to merge. Stacking on #9 lets the change land in narrative order with #9, dogfoods the stacked-mid-implementation mode #9 introduces, and unifies the case-study story.

If reviewers prefer to land #9 first and re-target this PR onto `main` afterward, that's a one-line `git rebase` — no content changes.

## Risks / Trade-offs

- **The rule depends on the `opsx-workflow` capability existing** → mitigated by stacking on PR #9. If #9 is held or substantially rewritten, this change rebases onto whatever lands.
- **CLAUDE.md may not be re-read mid-session** → mitigated by the in-skill one-line note. An LLM that's about to call `openspec archive` will (per its own habit) read the skill body first, where the note lives.
- **The rule doesn't enforce itself** — an LLM can still ignore it → accepted. The same is true of every spec-level rule the workflow introduces; enforcement is a combination of `/opsx:review` (which detects silent decisions) and the drift monitor (which detects spec divergence). This rule is one more line item in those existing enforcement loops, not a new mechanism.
- **The rule could be over-applied** (e.g. an LLM refuses to use `openspec status` because it's a CLI command, despite `status` having no hooks) → mitigated by Scenario 2 in the spec, which explicitly says hook-free CLI use is acceptable. The rule names side effects as the discriminator.
- **The `openspec` CLI might gain hook support later** → would make this rule unnecessary for CLI invocations from then on. Treat as a graduation criterion: if the CLI starts reading `config.yaml hooks`, this rule's premise weakens and it can be deprecated (or restricted to the cases where hook support is still missing).

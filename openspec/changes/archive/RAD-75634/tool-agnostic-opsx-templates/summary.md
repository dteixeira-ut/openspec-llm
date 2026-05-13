## Change Summary: tool-agnostic-opsx-templates

### What Was Built
Rewrote 7 of 11 canonical opsx templates (`apply`, `archive`, `plan`, `pr`, `propose`, `refine`, `suggest`) to use tool-agnostic prose so Cursor and Codex users execute the same procedural steps as Claude. The 28 previously-audited Claude-specific tool references (`AskUserQuestion`, `TodoWrite`, `ScheduleWakeup`, `Skill tool`) are removed from template bodies; the only remaining Claude-specific surface is the HTML-comment affordance hint in two shapes: single-line for discrete-option questions, and block-level for multi-step Claude-only sub-flows (only `pr.md`'s polling loop uses the block form). Every affordance hint is followed by a tool-agnostic fallback that stands alone for non-Claude tools.

### Why
The just-shipped single-source generator delivered the right architecture, but the template bodies were biased toward Claude — Cursor and Codex got working but degraded behavior, and `ScheduleWakeup` had no equivalent at all. Calling the package "cross-tool" while shipping Claude-flavored prose would mislead consumers of the planned `@usertesting/opsx` extraction. This change makes the templates honestly tri-tool.

### Key Decisions
- **Augment, never replace** — every affordance hint MUST be followed by tool-agnostic prose that stands alone. The pattern can scale to block-level hints without sliding back into hidden per-tool forks. Enforced by a generator warn on orphan affordance blocks.
- **Polling loop preserved for Claude via block-level affordance** rather than dropped — the v1 plan deleted it for parity, but explicit user pushback corrected this. Affordances should preserve capability where available, not level down to the lowest common denominator.
- **Generator warn is non-fatal** — same shape as the existing description-quality warn. Soft signal in CI, not a gate. Authors fix during commit; if drift becomes a real problem, escalation to error is a follow-up.
- **HTML-comment hint token: `<!-- Claude affordance: ... -->`** — "affordance" matches Claude Code's own terminology and grep/scan cleanly.
- **No template language, no per-tool conditional blocks** — honors Decision 3 of the prior change. Hint pattern is markdown-native, reviewable, and degrades cleanly.

### Spec Changes
- **opsx-template-sync** (modified): 4 new requirements added — tool-agnostic prose, two-shape affordance hint rules, `pr.md` emit-URL-and-exit-with-Claude-polling, generator Claude-isms warn. Total now 11 requirements.

### Tasks Completed
**22/22 tasks complete**
- §1 Template rewrites (8): 7 templates rewritten per Decision 5's recipe; the 4 already-clean templates verified.
- §2 Generator extension (3): `scanForClaudeIsms` + orphan-block detection wired into `--check`; `--self-test` with 5 fixtures.
- §3 Regenerate (4): clean regeneration; idempotent; `pr.md` outputs verified to retain the block-level affordance + fallback.
- §4 Docs (3): "Tool-agnostic authoring" section added to `templates/opsx/README.md` with recipe table and cross-link from top.
- §5 Verification (5): manual `pr.md` walkthrough, `--strict` + `--all` validation, residual `rg` confirms zero Claude-isms outside affordance comments.

### Decisions made without consultation
**From `design.md`**
- HTML-comment hint format `<!-- Claude affordance: ... -->` — Alternative: `<!-- claude-only: ... -->` or `<!-- @claude ... -->`. Rationale: "affordance" matches Claude Code's own terminology; the form is easy to grep and to scan-match in the generator warn.

**From implementation**
- Claude-isms scan runs before `runSync` in `--check` so warnings precede the clean/dirty verdict line. Matches the existing description-quality warn pattern.
- README authoring section placed above "Known limitations" rather than at end-of-file, for discoverability; referenced from the cross-link at the top.
- `console.warn` used for hint output, consistent with the existing description-quality warning path.
- `propose.md`'s first AskUserQuestion call drops the "(open-ended, no preset options)" parenthetical — design Decision 5's recipe for free-form questions is just the plain prose, so the annotation is now implicit in the absence of a hint.
- `archive.md`'s "use Task tool (subagent_type: 'general-purpose', prompt: ...)" rewritten to "delegate to a sub-agent or sub-workflow that invokes openspec-sync-specs" — the explicit `subagent_type` parameter is dropped (it was Claude-specific) but the procedural intent is preserved.

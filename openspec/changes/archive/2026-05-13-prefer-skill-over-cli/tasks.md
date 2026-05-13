## 1. Living spec

- [x] 1.1 The delta spec at `openspec/changes/prefer-skill-over-cli/specs/opsx-workflow/spec.md` is the source of truth; archive will sync it into `openspec/specs/opsx-workflow/spec.md`. No manual edit to the living spec is required at this stage.
- [x] 1.2 Verify `openspec status --change prefer-skill-over-cli` reports the delta as `done` after authoring (already true at planning time)

## 2. `CLAUDE.md` — discovery surface

- [x] 2.1 Add a "Workflow-tool invocation" section (3–5 lines) at the end of `CLAUDE.md` stating the rule briefly and pointing at the `opsx-workflow` living spec for the full text
- [x] 2.2 Name the today-applicable CLI ↔ skill instance explicitly: `openspec archive` ↔ `/opsx:archive` (CLI does not execute `hooks.post-archive`; only the skill does)
- [x] 2.3 Note the rule's must-ask escalation for environments where the skill is unreachable

## 3. In-skill enforcement note

- [x] 3.1 Add a one-line note near the top of `.claude/commands/opsx/archive.md` (between the frontmatter and the first instruction step) reading something like: *"⚠ Do NOT bypass this skill by calling `openspec archive` directly — the post-archive hooks in `openspec/config.yaml` only fire from this skill. See `openspec/specs/opsx-workflow/spec.md` (Requirement: Workflow operations with declared side effects)."*
- [x] 3.2 No edit required to `.claude/skills/openspec-archive-change/SKILL.md` — the skill body is what the command file already references; the rule is consumed via the command surface

## 4. Archive via the skill (dogfoods the rule this change ships)

- [x] 4.1 Run `openspec status --change prefer-skill-over-cli` — all artifacts `done`
- [x] 4.2 Invoke `/opsx:archive prefer-skill-over-cli` via the Skill tool. The skill body's step 7 reads `openspec/config.yaml hooks.post-archive` and invokes `/opsx:summarize`, so `summary.md` is generated automatically. **Per the rule this change codifies, the CLI MUST NOT be used directly if the skill is reachable.**
- [x] 4.3 If the Skill tool is unreachable in the current environment (Scenario 3 in the new spec requirement), treat as a must-ask escalation: log the unreachability in a `## Decisions made without consultation` section of `tasks.md` (this section, below), then fall back to `openspec archive ... --yes` + manual `summary.md` generation following the procedure in `.claude/commands/opsx/summarize.md`. Record the side effects that would have fired (which hooks, what they produce) in the escalation log so the audit trail is complete.

## 5. Decisions made without consultation (this change)

- [x] 5.1 The five proposal-level decisions (see `proposal.md`) are surfaced in the PR body when this PR opens
- [x] 5.2 Any additional may-decide calls discovered during implementation are appended to the PR body before opening

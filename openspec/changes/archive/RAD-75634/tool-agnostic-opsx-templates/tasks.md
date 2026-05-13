## 1. Template body rewrites

- [x] 1.1 Rewrite `templates/opsx/apply.md`: replace each Claude-specific tool reference (3 hits per the audit) with the tool-agnostic recipe in design Decision 5. Preserve every step number, conditional branch, bash snippet, and artifact reference exactly.
- [x] 1.2 Rewrite `templates/opsx/archive.md` (4 hits) following the same recipe. Pay special attention to the "Assess delta spec sync state" prompt — discrete-option case, qualifies for an HTML-comment affordance hint.
- [x] 1.3 Rewrite `templates/opsx/plan.md` (4 hits).
- [x] 1.4 Rewrite `templates/opsx/pr.md` (6 hits). For the `ScheduleWakeup` polling loop (steps 8b/9b of the current file): wrap the polling instructions in a block-level Claude-affordance hint (`<!-- Claude affordance: poll for reviewer response\n... existing polling instructions verbatim ...\n-->`) and add tool-agnostic prose immediately below: "After posting the reviewer comment, emit the PR URL. The reviewer (if configured) will respond asynchronously; the user should monitor the PR at the printed URL." For the other 5 hits in pr.md, apply the recipe in design Decision 5. The guardrails section retains the polling reference but moves it inside the affordance block.
- [x] 1.5 Rewrite `templates/opsx/propose.md` (4 hits).
- [x] 1.6 Rewrite `templates/opsx/refine.md` (5 hits).
- [x] 1.7 Rewrite `templates/opsx/suggest.md` (2 hits).
- [x] 1.8 Verify the 4 untouched templates (`code-review.md`, `explore.md`, `review.md`, `summarize.md`) really have no Claude-isms by running `rg -n 'AskUserQuestion|TodoWrite|ScheduleWakeup|Skill tool' templates/opsx/{code-review,explore,review,summarize}.md` and confirming zero hits.

## 2. Generator warn extension

- [x] 2.1 In `bin/opsx-sync.ts`, add a `scanForClaudeIsms(templatePath, body)` function that returns a list of `{ line, match }` for every literal `AskUserQuestion`, `TodoWrite`, `ScheduleWakeup`, or `Skill tool` occurrence in the body, excluding any occurrence inside an HTML comment whose first non-whitespace content matches `Claude affordance:` (both single-line and block-level shapes). Also detect block-level affordance hints whose next non-blank line is another HTML comment or end-of-file — flag those as "missing tool-agnostic fallback" warnings per spec scenario "Block-level hint missing a tool-agnostic fallback".
- [x] 2.2 Wire the scan into the existing `--check` flow alongside the description-quality warn. Emit `WARN: templates/opsx/<id>.md:<line>: Claude-specific tool reference '<name>' — replace with tool-agnostic prose`. Non-fatal; do not exit non-zero on warnings.
- [x] 2.3 Add a small fixture-test path: a temporary template with a deliberate Claude-ism should produce the expected warn line and exit 0. Implement this as a `--self-test` flag or as an inline assertion at the top of `bin/opsx-sync` that runs when `NODE_ENV=test` is set, whichever fits the existing generator shape.

## 3. Re-run the generator and update outputs

- [x] 3.1 Run `node bin/opsx-sync` to regenerate `.claude/commands/opsx/*.md` and `.cursor/commands/opsx-*.md` from the rewritten templates. Stage the generated diff alongside the template diff.
- [x] 3.2 Run `node bin/opsx-sync --check` and confirm exit `0`. Capture any warnings the new scan emits — at this point, the only allowed warnings are description-quality (existing) and zero Claude-isms (since the rewrite is complete).
- [x] 3.3 Inspect `.claude/commands/opsx/pr.md` and `.cursor/commands/opsx-pr.md`: both SHALL contain the block-level Claude-affordance comment around the polling instructions AND the tool-agnostic fallback prose below. The generated banner sits above frontmatter as today.
- [x] 3.4 Run `bin/opsx-sync` again to confirm a clean second run produces no diff (idempotency).

## 4. Documentation

- [x] 4.1 Add a "Tool-agnostic authoring" section to `templates/opsx/README.md` covering: the rule (no Claude-specific tool names in bodies), the replacement recipe table from design Decision 5, the HTML-comment hint format for Claude affordances, and the `--check` warn that catches regressions.
- [x] 4.2 Cross-link the new section from the top of `templates/opsx/README.md` so future template authors hit the rule before they write.
- [x] 4.3 Update the top-level `README.md` "Workflow" section if it mentions `ScheduleWakeup` polling or any specific Claude-only behavior in the PR flow.

## 5. Verification

- [x] 5.1 Spot-check every rewritten template: read `templates/opsx/<id>.md` before-vs-after by reading from the prior commit and confirm step numbers, bash snippets, conditional branches, and artifact references survive verbatim.
- [x] 5.2 Run `openspec validate tool-agnostic-opsx-templates --strict` and confirm success.
- [x] 5.3 Run `openspec validate --all` and confirm no other specs regressed.
- [x] 5.4 Manually walk through `pr.md` end-to-end on a hypothetical PR creation: confirm Claude's path runs the polling loop (the affordance block) and emits the URL; confirm Cursor/Codex's path emits the URL and exits cleanly without engaging the polling instructions.
- [x] 5.5 Final `rg -n 'AskUserQuestion|TodoWrite|ScheduleWakeup|Skill tool' templates/opsx/` returns hits only inside `<!-- Claude affordance: ... -->` comments (single-line or block). Confirm.

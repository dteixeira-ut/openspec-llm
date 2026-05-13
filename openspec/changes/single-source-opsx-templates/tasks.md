## 1. Canonical templates directory

- [x] 1.1 Create `templates/opsx/` directory at repo root
- [x] 1.2 Author `templates/opsx/apply.md` by merging `.claude/commands/opsx/apply.md` (ambiguity contract) with `.codex/skills/openspec-apply-change/SKILL.md` (auto-review-on-completion step). Verify the merged body matches the Legacy preservation rules in proposal.md.
- [x] 1.3 Author `templates/opsx/propose.md` by merging `.claude/commands/opsx/propose.md` (legacy gap-analysis pre-pass + ambiguity contract) with `.codex/skills/openspec-propose/SKILL.md`. Verify.
- [x] 1.4 Author `templates/opsx/archive.md` by merging `.claude/commands/opsx/archive.md` (current Claude body) with `.codex/skills/openspec-archive-change/SKILL.md` (RAD ticket extraction + post-archive hooks). Verify.
- [x] 1.5 Author `templates/opsx/explore.md` from any of the three trees (bodies identical modulo frontmatter).
- [x] 1.6 Author `templates/opsx/plan.md` from `.claude/commands/opsx/plan.md` (Claude-only today; no merge needed).
- [x] 1.7 Author `templates/opsx/refine.md` from `.claude/commands/opsx/refine.md` (Claude-only today; no merge needed).
- [x] 1.8 Author `templates/opsx/pr.md` from `.claude/commands/opsx/pr.md` (Claude version is canonical body per design Decision 4; codex/cursor versions are strict subsets).
- [x] 1.9 Author `templates/opsx/review.md` from `.claude/commands/opsx/review.md` (same reasoning as 1.8).
- [x] 1.10 Author `templates/opsx/suggest.md` from `.claude/commands/opsx/suggest.md` (same reasoning).
- [x] 1.11 Author `templates/opsx/summarize.md` from `.claude/commands/opsx/summarize.md` (same reasoning).
- [x] 1.12 Author `templates/opsx/code-review.md` from `.claude/skills/code-review/SKILL.md` (currently Claude-only skill; rebodies as a command-form template).
- [x] 1.13 Add a one-page `templates/opsx/README.md` documenting: canonical template format, frontmatter contract, the `openspec update && bin/opsx-sync` recipe, and how to add a new workflow.
- [x] 1.14 For each template authored in 1.2–1.12, copy the **rich auto-invocation `description:` field** from the legacy `.claude/skills/openspec-<id>/SKILL.md` (the "Use when…" style), not the terse one from `.claude/commands/opsx/<id>.md`. For `code-review`, `plan`, `refine`, `pr`, `review`, `suggest`, `summarize` (no legacy skill counterpart in some cases), author a description in the same style.

## 2. Generator (`bin/opsx-sync`)

- [x] 2.1 Add `bin/opsx-sync` entry to `package.json` (top-level `bin` field) and any TypeScript deps needed (`js-yaml` for frontmatter parsing if Node stdlib insufficient).
- [x] 2.2 Implement `bin/opsx-sync.ts` reader stage: enumerate every `templates/opsx/*.md`, parse YAML frontmatter, extract body.
- [x] 2.3 Implement Claude adapter: write each template to `.claude/commands/opsx/<id>.md` with Claude-shaped frontmatter (`name: "OPSX: <Title>"`, `description:`, `category: Workflow`, `tags: [...]`) and the `<!-- generated from templates/opsx/<id>.md — do not edit -->` banner immediately after frontmatter.
- [x] 2.4 Implement Cursor adapter: write each template to `.cursor/commands/opsx-<id>.md` with Cursor-shaped frontmatter and the generated banner.
- [x] 2.5 Implement Codex adapter: write each template to `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<id>.md` with Codex-shaped frontmatter and the generated banner. Path resolved at run time (no project-local `.codex/commands/`). Match upstream `openspec init` placement per design Decision 5.
- [x] 2.6 Implement delete-on-removed-template behavior: any file in a tool's command directory (Claude/Cursor/Codex global) matching the `opsx-*` (or nested `opsx/<id>.md`) pattern but with no corresponding `templates/opsx/<id>.md` SHALL be deleted on the next run.
- [x] 2.7 Implement `--check` flag: same logic as default run, but compare in-memory output against on-disk content. Exit `0` on match, `1` on diff, and print the diff to stdout. Used by CI. Add a `--scope=ci` flag (or equivalent) that excludes the Codex global path so CI doesn't fail on machines without `$CODEX_HOME` configured; local runs always include all three tools.
- [x] 2.8 Add a `pnpm opsx-sync` / `npm run opsx-sync` script entry in `package.json` for ergonomics.
- [x] 2.9 Manual smoke test: run `bin/opsx-sync`, verify generated `.claude/commands/opsx/apply.md` equals the body in `templates/opsx/apply.md` plus the banner, and that `.cursor/commands/opsx-apply.md` differs only by frontmatter shape.

## 3. CI drift-check gate

- [x] 3.1 Create `.github/workflows/opsx-template-drift.yml` with: trigger on `pull_request` and `push` to `main`, single job that runs `npm ci && bin/opsx-sync --check --scope=ci` (CI scope skips Codex's global path since it lives outside the repo).
- [x] 3.2 On failure, the job SHALL print the diff and the remediation hint `Run bin/opsx-sync locally and commit the result.`
- [x] 3.3 Manual verification: open a draft PR that edits `templates/opsx/apply.md` without regenerating, confirm CI fails with a readable diff.
- [x] 3.4 Manual verification: edit `.claude/commands/opsx/apply.md` directly without touching the template, confirm CI fails (regeneration would revert).

## 4. Legacy tree deletion

- [x] 4.1 Delete `.claude/skills/openspec-apply-change/`, `.claude/skills/openspec-archive-change/`, `.claude/skills/openspec-explore/`, `.claude/skills/openspec-plan/`, `.claude/skills/openspec-propose/`.
- [x] 4.2 Delete `.claude/skills/code-review/` (replaced by generated `.claude/commands/opsx/code-review.md`).
- [x] 4.3 Delete every directory under `.codex/skills/` (`openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-pr`, `openspec-propose`, `openspec-review`, `openspec-suggest`, `openspec-summarize`). If `.codex/skills/` is empty after deletion, remove the empty parent. (No project-local `.codex/commands/` directory is created — Codex commands go to the user's global `$CODEX_HOME/prompts/` per design Decision 5.)
- [x] 4.4 Delete every directory under `.cursor/skills/` (same list as 4.3). If `.cursor/skills/` is empty after deletion, remove it.
- [x] 4.5 Enumerate adjacent references to the deleted skill paths and update each: (a) grep the repo for `.claude/skills/`, `.codex/skills/`, `.cursor/skills/` literal strings; (b) for each hit, update the reference to point at the new template location (`templates/opsx/<id>.md`) or remove if stale. Hits likely in: `README.md`, `apps/presentation/` slide content referencing skill counts/paths, `openspec/specs/opsx-plan-command/spec.md` (mentions `openspec-plan` skill), and any prior change archives (do NOT edit archive contents; only update active code/docs).
- [x] 4.6 Run `rg -n 'openspec-(apply-change|archive-change|explore|propose|pr|review|suggest|summarize)'` and verify the only remaining matches are inside `openspec/changes/archive/` (historical) or this change's own artifacts.

## 5. Documentation and presentation updates

- [x] 5.1 Update `README.md` "Repository Structure" section to add `templates/opsx/` and `bin/opsx-sync`, and remove references to per-tool skill folders.
- [x] 5.2 Update `README.md` "Workflow" section: mention the canonical templates layer and the `openspec update && bin/opsx-sync` recipe.
- [x] 5.3 In `README.md` or `templates/opsx/README.md`, document that Codex commands are written to `$CODEX_HOME/prompts/` (matching upstream); contributors must run `bin/opsx-sync` locally after pulling template changes so their global prompts stay current. Note the CI scope-gap explicitly.
- [x] 5.4 If `apps/presentation/` slides reference per-tool skill counts or paths (`.claude/skills/`, `.codex/skills/`), update them or note them as historical.

## 6. Verification

- [x] 6.1 Run `bin/opsx-sync` clean and confirm `git status` is empty (re-running the generator on a fresh tree produces no changes).
- [x] 6.2 Run `bin/opsx-sync --check` and confirm exit code `0`.
- [x] 6.3 Run `openspec validate single-source-opsx-templates --strict` and confirm success.
- [x] 6.4 Spot-check each generated command in turn: open `.claude/commands/opsx/apply.md`, confirm it has the generated banner, the Claude frontmatter shape, and the full merged body including both the ambiguity contract and the auto-review-on-completion step.

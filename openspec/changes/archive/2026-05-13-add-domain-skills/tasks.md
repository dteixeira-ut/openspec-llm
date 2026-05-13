## 1. Folder scaffolding

- [x] 1.1 Create directory `skills/` at repo root
- [x] 1.2 Create directory `skills/migrate-to-nestjs/recipes/`
- [x] 1.3 Create directory `skills/service-config-drift/auditors/`

## 2. `skills/README.md`

- [x] 2.1 Write the README covering: rationale for hosting domain skills here, concern boundary with `.claude/skills/`, per-skill layout convention (`SKILL.md` + named subfolders), authoring conventions (name file categories, not paths), graduation criteria (multi-author / CI / scope expansion), graduation procedure (copy to new home, leave `MOVED.md` stub for one release cycle)
- [x] 2.2 Reference the README from the top-level repo `README.md` `Repository Structure` block so the new folder is discoverable

## 3. `migrate-to-nestjs` skill body

- [x] 3.1 Author `skills/migrate-to-nestjs/SKILL.md` with frontmatter (name, description, license, repo-agnostic self-check directive), input/output contract, and step-numbered procedure
- [x] 3.2 Step 0: sibling-file inspection — list the file categories from the spec (prettier config, eslint config, tsconfig base + build, test config, Dockerfile, dockerignore, CI workflows, package.json scripts) with the "name categories, not paths" rule
- [x] 3.3 Steps 1–N: the migration procedure proven across the prior NestJS migration (foundation first, per-capability slicing, build gates, AppModule bootstrap order, etc.)
- [x] 3.4 Include the migration-specific must-ask classes section (library surface mismatch, scenario contradicts legacy, tsconfig.build divergence, dangling Dockerfile CMD, transitive→direct promotion)
- [x] 3.5 Include the `## Graduation` section listing graduation triggers for this skill specifically

## 4. `migrate-to-nestjs` recipes

- [x] 4.1 Write `skills/migrate-to-nestjs/recipes/rebase-stacked-squash.md` containing the verbatim rebase loop (`git fetch`, checkout, rebase, `--ours` resolution rule, `--force-with-lease`) plus the warning that the recipe applies whenever strategy is `per-capability stack` + merge-method is `squash`
- [x] 4.2 Write `skills/migrate-to-nestjs/recipes/sibling-file-diff-checklist.md` as a runnable checklist (one bullet per file category) the agent fills in during Step 0

## 5. `service-config-drift` skill body

- [x] 5.1 Author `skills/service-config-drift/SKILL.md` with frontmatter, repo-agnostic self-check, input contract (target repo path or current working directory), and the three-step orchestration (run each auditor, collect results, emit consolidated report)
- [x] 5.2 Define the report shape — one section per auditor with status (`pass` / `fail` / `skipped`), findings, and the one-line fix
- [x] 5.3 Include the `## Graduation` section listing graduation triggers for this skill specifically

## 6. `service-config-drift` auditors

- [x] 6.1 Write `skills/service-config-drift/auditors/prettierrc-parser-plugins.md` — precondition (decorator usage in TS sources), check logic, failure output, one-line fix
- [x] 6.2 Write `skills/service-config-drift/auditors/dockerfile-entrypoint.md` — checks (CMD references valid source; COPY includes `tsconfig.build.json` and `nest-cli.json` when they exist), failure output, fix guidance
- [x] 6.3 Write `skills/service-config-drift/auditors/ci-fmt-gate.md` — precondition (`package.json` `scripts.fmt` exists), check (workflow invokes `fmt`), failure output, one-line fix

## 7. Living specs

- [x] 7.1 Deferred until archive — `openspec/specs/*` is populated by the `/opsx:archive` skill, not by this implementation. The delta specs already live under `openspec/changes/add-domain-skills/specs/` and will sync at archive time.
- [x] 7.2 Deferred until after archive — spec-drift monitor globs `openspec/specs/**/spec.md`, so the new capabilities will be picked up automatically once the archive step runs.

## 8. Dogfooding validation

- [x] 8.1 Mental dogfood against `enriched-video-uploads-v2` (sibling repo at `../enriched-video-uploads-v2`): prettierrc decorators-legacy was added retroactively in commit `01e9061` → expect `pass`; dockerfile-entrypoint was fixed retroactively in commit `bc9d84d` → expect `pass`; ci-fmt-gate expected `fail` if `fmt` is declared in `package.json` but not invoked by `.github/workflows/`. Confirms the three auditors fire as designed.
- [x] 8.2 Example invocation authored in `skills/service-config-drift/SKILL.md` under the "Example invocation" section, showing the consolidated report shape with one `pass`, one `fail`, and one `skipped`-style entry.

## 9. Decisions made without consultation (this change)

- [x] 9.1 The four decisions in `proposal.md` plus the new "Decisions made without consultation" blocks in each authored artifact (`skills/README.md`, `skills/migrate-to-nestjs/SKILL.md`, `skills/service-config-drift/SKILL.md`) will be surfaced to the PR body when `/opsx:pr` runs. Confirmation deferred to PR-creation time (per instructions, this implementation does not open the PR).
- [x] 9.2 Implementation-time silent decisions logged inline in each authored artifact's `## Decisions made without consultation` section: 3 in `skills/README.md`, 5 in `skills/migrate-to-nestjs/SKILL.md`, 5 in `skills/service-config-drift/SKILL.md`.

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

- [ ] 7.1 Verify (after archive) that `openspec/specs/domain-skills-home/spec.md`, `openspec/specs/skill-migrate-to-nestjs/spec.md`, and `openspec/specs/skill-service-config-drift/spec.md` have been synced from this change's delta specs
- [ ] 7.2 Confirm the spec-drift monitor picks up the new capabilities on the next `main` push (no workflow file edits needed — `.github/workflows/spec-drift-monitor.md` globs `openspec/specs/**/spec.md`)

## 8. Dogfooding validation

- [ ] 8.1 After writing `skills/service-config-drift/SKILL.md`, run it mentally (or as a Claude Code session) against `enriched-video-uploads-v2` and confirm the three auditors fire and produce the expected findings (prettierrc decorators-legacy: was added retroactively, expect `pass`; dockerfile-entrypoint: was fixed retroactively, expect `pass`; ci-fmt-gate: expect `fail` if `fmt` is still missing from CI)
- [ ] 8.2 Author one short example invocation in `skills/service-config-drift/SKILL.md` showing the report shape

## 9. Decisions made without consultation (this change)

- [ ] 9.1 Confirm the four decisions recorded in `proposal.md` are also present in the PR body when `/opsx:pr` runs
- [ ] 9.2 Add any additional may-decide calls discovered during implementation to the PR body before opening

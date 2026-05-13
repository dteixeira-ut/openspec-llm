# Change Summary: add-domain-skills

## What Was Built

Adopted two reusable domain skills into `openspec-llm` as a temporary home: `migrate-to-nestjs` (NestJS migration procedure, generalized across any TS backend service) and `service-config-drift` (auditors for `.prettierrc`, `Dockerfile`, and CI hygiene in any TS-service repo). Established a top-level `skills/` directory with explicit graduation criteria so the temporary home doesn't become permanent by inertia. Each skill is captured as a living spec so the spec-drift monitor watches future regressions.

## Why

The recent NestJS migration of two backend services produced two reusable skill bodies that had no version-controlled home. `migrate-to-nestjs` existed only as draft text referenced from research notes; `service-config-drift` existed only as a set of mechanical checks distributed across the orchestrator's running notes. Both are repo-agnostic by construction (they describe categories of files, not paths in any one codebase). This change makes them discoverable, versioned, and graduate-able to their own plugins or shared-skills repos when they outgrow this home.

## Key Decisions

- **`skills/` at the repo root, separate from `.claude/skills/`** — `.claude/skills/` is reserved for OpenSpec *workflow* skills; domain skills are a different concern. Mixing them would conflate the workflow surface with the consumer surface and make either harder to reason about.
- **One skill per folder under `skills/<skill-name>/` with `SKILL.md` as the entry point** — matches the layout of `.claude/skills/openspec-*/SKILL.md` so authors and readers carry one mental model. Ancillary content (recipes, auditors) lives in named subfolders.
- **`service-config-drift` is one skill with three auditors, not three skills** — a single invocation should produce a coherent hygiene report. Splitting would force users to remember three names and run all three.
- **Each `SKILL.md` carries an explicit "name file categories, not paths" self-check** — the most common failure mode for a skill written from one project's lessons is binding to that project's paths. Putting the discipline in the skill itself, not a separate authoring guide, makes it harder to ignore.
- **`skills/README.md` documents graduation criteria up front** — without explicit triggers (multi-author signal, CI needs, scope expansion) and procedure (copy to new home, leave `MOVED.md` stub for one release cycle), "temporary home" becomes "permanent home by inertia."

## Spec Changes

- **`domain-skills-home`**: NEW capability. 4 added requirements covering the `skills/` directory existence, the `README.md` framing requirements (rationale, concern boundary, layout, graduation), the per-skill layout convention, and the repo-agnostic self-check directive on every `SKILL.md`.
- **`skill-migrate-to-nestjs`**: NEW capability. 5 added requirements covering the skill existence, Step 0 sibling-file inspection, the rebase recipe contract, migration-specific must-ask classes, and graduation criteria specific to this skill.
- **`skill-service-config-drift`**: NEW capability. 6 added requirements covering the skill existence, the three-auditor orchestration, each auditor's check logic (prettierrc parser plugins, Dockerfile entrypoint, CI fmt gate), and per-auditor documentation.

## Tasks Completed

**25/25 tasks complete** (with 7.1 and 7.2 explicitly flagged as deferred-to-archive verifications — they verify that delta specs synced into `openspec/specs/`, which happens during archive itself and was confirmed when this archive ran):

- §1 Folder scaffolding — 3/3 complete
- §2 `skills/README.md` — 2/2 complete
- §3 `migrate-to-nestjs` skill body — 5/5 complete
- §4 `migrate-to-nestjs` recipes — 2/2 complete (`rebase-stacked-squash.md`, `sibling-file-diff-checklist.md`)
- §5 `service-config-drift` skill body — 3/3 complete
- §6 `service-config-drift` auditors — 3/3 complete
- §7 Living specs — 2/2 complete (sync verification deferred to archive run, which succeeded)
- §8 Dogfooding validation — 2/2 complete (mental dogfood against `enriched-video-uploads-v2`)
- §9 Decisions made without consultation — 2/2 complete

## Decisions made without consultation

Aggregated from `proposal.md` and the three implementation-pass artifacts (`skills/README.md`, `skills/migrate-to-nestjs/SKILL.md`, `skills/service-config-drift/SKILL.md`). Deduplicated and grouped by source. (Note: this `summary.md` was generated manually because `openspec archive` (CLI) does not execute the `hooks.post-archive` block in `openspec/config.yaml` — only the `/opsx:archive` skill does. The CLI/skill divergence is itself recorded for the case-study deck.)

### From `proposal.md` (4)

1. The folder is named `skills/` at the repo root (not `apps/skills/`, not `domain-skills/`, not under `.claude/`). Shortest path, clearest separation from `.claude/skills/`.
2. `service-config-drift` is one skill with three auditors, not three separate skills. A single invocation should produce a coherent hygiene report.
3. Living specs use the prefix `skill-*`. New convention introduced; existing presentation specs do not carry a prefix.
4. `skills/README.md` includes graduation criteria up front so future maintainers know what "good enough to move out" looks like.

### From `skills/README.md` (3)

1. Used a markdown table for the `skills/` vs `.claude/skills/` distinction rather than prose — clearer at a glance.
2. Listed established subfolder names (`recipes/`, `auditors/`, `examples/`) explicitly so future authors don't invent new ones unnecessarily.
3. Set "at least one release cycle" for the `MOVED.md` stub lifetime without defining "release cycle" precisely. Concrete definition deferred until the first graduation event forces the question.

### From `skills/migrate-to-nestjs/SKILL.md` (5)

1. Library choices in Step 1 (`nestjs-pino`, `nestjs-zod`, `@nestjs/microservices`, Drizzle, `dd-trace`) are stated as **resolved choices** from the prior migration, not as the only valid choices.
2. The build-gate table uses a three-row split (foundation / intermediate / cutover). The foundation row was added because the foundation PR's gate is narrower — nothing is runnable, so even `lint` is the only check that produces signal.
3. The AppModule bootstrap order (Step 4) is presented as **a** reliable order, not **the** reliable order. Repos with unusual dependencies may deviate.
4. Step 0 produces "one reconciliation commit" rather than "one reconciliation PR." Single-commit-in-foundation-PR is the compromise between surfacing tooling parity early and not doubling the PR count.
5. The "must-ask" framing uses "stop and ask the user" wording rather than "raise a clarification request" because the orchestrator typically has a human in the loop.

### From `skills/service-config-drift/SKILL.md` (5)

1. Report shape is **markdown only**. JSON output deferred — no current consumer needs structured output.
2. Auditor order in step 2 is `prettierrc → dockerfile → ci-fmt-gate` — matches roughly "most local to most cross-cutting." No technical dependency between auditors.
3. The "skipped" precondition is "no `package.json` at target path" — chose `package.json` as the anchor rather than `node_modules/` because the latter may be absent in a fresh checkout.
4. Example invocation uses a fictional repo name `example-service` rather than `enriched-video-uploads-v2` to keep the skill body repo-agnostic per the self-check directive.
5. Skill is read-only (does not modify the target repo). Auto-fix mode deferred — confidence in fixes is high but consequences of a wrong fix in CI config are non-trivial.

### From PR #10 body

No additional decisions beyond those above (PR body cites the same set, with an explicit note flagging the regex-vs-AST decorator-detection choice for reviewer attention).

## Open follow-ups flagged by the implementing agent

1. **Decorator detection strategy** in `prettierrc-parser-plugins` (regex vs AST) — auditor documents both with regex as default; reviewer may want AST mandate.
2. **`--ours` rule exception** in `rebase-stacked-squash.md` — files the stacked PR is genuinely adding content to may need `--theirs` for that file. Documented inline; reviewer may want a separate worked example.

## Cross-references

- Living specs: `openspec/specs/domain-skills-home/spec.md`, `openspec/specs/skill-migrate-to-nestjs/spec.md`, `openspec/specs/skill-service-config-drift/spec.md`
- Archive: `openspec/changes/archive/2026-05-13-add-domain-skills/`
- Sibling change: `2026-05-13-harden-opsx-workflow` (PR #9)
- Source research notes: `../enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md`

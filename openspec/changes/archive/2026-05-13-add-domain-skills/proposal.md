## Why

The recent NestJS migration of two backend services produced two reusable skill bodies that have no home today: `migrate-to-nestjs` (the migration procedure, generalized across any NestJS-bound TypeScript service) and `service-config-drift` (auditors for `.prettierrc`, `Dockerfile`, and CI hygiene in any TS-service repo). Both are repo-agnostic by design — they describe categories of files, not paths in any one codebase. They're currently stranded between agent context, hand-written notes, and (for `migrate-to-nestjs`) a draft `SKILL.md` referenced from the migration's research notes but not version-controlled. This change adopts them into `openspec-llm` as a temporary home so they're under version control, discoverable, and graduate-able into their own plugin or shared-skills repo later.

## What Changes

- Create a new top-level `skills/` directory at the openspec-llm repo root (sibling to `apps/`, `openspec/`, `.claude/`). This is intentionally separate from `.claude/skills/` — those host the OpenSpec *workflow* skills; `skills/` hosts *domain* skills that the workflow consumes but is not coupled to.
- Add `skills/README.md` documenting (a) the framing — domain skills live here temporarily until they earn a dedicated home, (b) graduation criteria — when a skill should move out, (c) authoring conventions — each skill must name file *categories*, not paths from any one repo.
- Add `skills/migrate-to-nestjs/SKILL.md` plus `skills/migrate-to-nestjs/recipes/` containing the rebase-stacked-squash recipe and the sibling-file-diff checklist. The skill body codifies the procedure proven across the prior migration — Step 0 sibling-file inspection, the per-PR build gate, the stacked-PR stacking conventions, the must-ask classes specific to NestJS migrations.
- Add `skills/service-config-drift/SKILL.md` plus `skills/service-config-drift/auditors/` containing three documented auditors: prettierrc parser plugins, Dockerfile entry-point references, CI `fmt` gate presence. The skill is one entry point with three checks (not three separate skills) so a single invocation produces a coherent hygiene report.
- Capture each skill as a living spec under `openspec/specs/skill-migrate-to-nestjs/spec.md` and `openspec/specs/skill-service-config-drift/spec.md` so the existing spec-drift monitor watches them.

## Capabilities

### New Capabilities
- `skill-migrate-to-nestjs`: the requirements that govern the migrate-to-nestjs skill body — required steps, must-ask classes specific to NestJS migrations, the rebase recipe contract, and graduation criteria.
- `skill-service-config-drift`: the requirements for the service-config-drift skill — auditor surface, expected output shape, and the conditions under which each auditor fires.
- `domain-skills-home`: the requirements that govern the `skills/` directory itself — folder layout, README contents, authoring conventions, graduation criteria. This is the meta-capability that defines what it means for a skill to "live here for now."

### Modified Capabilities
<!-- None — no existing capability is changed. -->

## Impact

- **New files**: `skills/README.md`, `skills/migrate-to-nestjs/SKILL.md`, `skills/migrate-to-nestjs/recipes/rebase-stacked-squash.md`, `skills/migrate-to-nestjs/recipes/sibling-file-diff-checklist.md`, `skills/service-config-drift/SKILL.md`, `skills/service-config-drift/auditors/prettierrc-parser-plugins.md`, `skills/service-config-drift/auditors/dockerfile-entrypoint.md`, `skills/service-config-drift/auditors/ci-fmt-gate.md`, plus the three living specs.
- **No edits** to `.claude/`, `apps/`, `openspec/config.yaml`, or `.github/workflows/`. This change does not touch the workflow itself — that's the sibling `harden-opsx-workflow` change.
- **Cross-change ordering**: this change is independent of `harden-opsx-workflow` and can ship before, after, or in parallel. Dogfooding consideration: if `harden-opsx-workflow` lands first, this change's proposal/design/spec/tasks artifacts will themselves be authored under the new rules — a useful validation pass.
- **Out of scope**: actually invoking the new skills against the real `enriched-video-uploads-v2` repo (or any other consumer repo). That's an application of the skills, not part of this change.

## Decisions made without consultation

Per the ambiguity contract proposed in `harden-opsx-workflow`, recording silent calls made while drafting this proposal:

1. The folder is named `skills/` at the repo root (not `apps/skills/`, not `domain-skills/`, not under `.claude/`). Reason: shortest path, clearest separation from `.claude/skills/`.
2. `service-config-drift` is one skill with three auditors, not three separate skills. Reason: a single invocation should produce a coherent hygiene report; users want "run all checks," not three individual commands.
3. Living specs use the prefix `skill-*` (e.g. `skill-migrate-to-nestjs`) to make their nature obvious in `openspec/specs/`. The presentation app's specs (`presentation-content`, `presentation-shell`) do not carry a prefix, so this is a new convention introduced here.
4. The `skills/README.md` includes graduation criteria up front so future maintainers know what "good enough to move out" looks like — avoiding the failure mode where a temporary home becomes permanent by inertia.

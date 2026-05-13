## Context

`openspec-llm` was created as a focused experiment in spec-driven development with Claude Code. Its existing surface — `apps/presentation/`, `.claude/commands/opsx/`, `.claude/skills/openspec-*/`, `openspec/` — is all about the OpenSpec workflow itself. Domain skills (skills that aren't *about* OpenSpec but are *used* by teams that adopt OpenSpec) have no canonical home in the org today.

The recent NestJS migration produced two such skills:

- **`migrate-to-nestjs`** — captures the proven procedure for migrating a TypeScript backend service to NestJS, including the Step 0 sibling-file inspection (`.prettierrc`, `tsconfig.build.json`, `Dockerfile`, CI workflows), the stacked-PR + squash-merge rebase recipe, and the must-ask classes specific to a NestJS rewrite. Currently exists as draft text referenced from `enriched-video-uploads-v2/openspec/research/sdd-exploration-notes.md` but not version-controlled.
- **`service-config-drift`** — three auditors for catching configuration mismatches that bite at deploy time: `.prettierrc` parser-plugin reconciliation, Dockerfile entry-point validation against `src/`, and CI `fmt`-gate presence. Each is a function of "what's in this repo," not "what's in any specific repo."

Both are repo-agnostic by construction. The user explicitly framed `openspec-llm` as an "ok home for now" given that the workflow was used to develop them; the design follows from that constraint.

## Goals / Non-Goals

**Goals:**

- Give the two skills a version-controlled home with a clear story for what lives there and why.
- Capture both skills as living specs so the existing drift monitor catches future regressions.
- Establish a folder convention that scales to additional domain skills without forcing them all into `.claude/skills/` (where they would get conflated with the workflow's own skills).
- Make graduation easy: any domain skill should be moveable to its own plugin or shared-skills repo without breaking the workflow.

**Non-Goals:**

- Authoring the actual skill content from scratch as a research effort. The `migrate-to-nestjs` body codifies what was already proven across a real migration; `service-config-drift` codifies three checks whose logic is mechanical.
- Building a skill loader, registry, or discovery mechanism. Skills under `skills/` are read-only documentation invoked manually until graduation.
- Wiring the new skills into `.claude/skills/` symlinks or any auto-import.
- Modifying the OpenSpec workflow surface. That's `harden-opsx-workflow`'s scope.
- Generating per-repo CI workflows. `service-config-drift` describes the checks; the consuming repo applies them via its own CI configuration.

## Decisions

### Decision 1: `skills/` at repo root, not under `.claude/`

`.claude/skills/` is reserved for skills that are part of the OpenSpec workflow itself (`openspec-propose`, `openspec-apply-change`, etc. — invoked by the `/opsx:*` commands). Mixing domain skills there would conflate two different concerns and make the workflow's own surface harder to reason about.

Top-level `skills/` keeps the separation explicit and matches the conceptual model: domain skills sit beside the workflow skills, consumed by the same agents but owned by a different layer.

Chosen over: `.claude/skills/` (concern-conflation); `apps/skills/` (skills are not apps); `domain-skills/` (verbose, no benefit over `skills/`); a separate sibling repo (raises adoption cost during the "for now" phase).

### Decision 2: One skill per folder under `skills/<skill-name>/`, with `SKILL.md` as the entry point and ancillary content in named subfolders

Matches the layout of `.claude/skills/openspec-*/SKILL.md` so authors and readers carry one mental model. Ancillary content (recipes, auditors, examples) lives in named subfolders (`recipes/`, `auditors/`) so each piece is a discrete, citable file.

`migrate-to-nestjs/recipes/`:
- `rebase-stacked-squash.md` — verbatim rebase recipe from the migration findings (the `--ours` vs `--theirs` rule and the loop).
- `sibling-file-diff-checklist.md` — Step 0 inspection list: `.prettierrc`, `eslint.config.*`, `tsconfig.json`, `tsconfig.build.json`, `jest.config.*`, `Dockerfile`, `.dockerignore`, `.github/workflows/*.yml`, `package.json` scripts.

`service-config-drift/auditors/`:
- `prettierrc-parser-plugins.md` — checks `importOrderParserPlugins` includes `decorators-legacy` when the repo contains NestJS decorators.
- `dockerfile-entrypoint.md` — greps `Dockerfile` for `CMD ["node", "dist/<x>.js"]` and verifies `src/<x>.ts` exists.
- `ci-fmt-gate.md` — verifies `npm run fmt` is invoked in CI if `package.json` defines an `fmt` script.

### Decision 3: `service-config-drift` is one skill with three auditors, not three separate skills

A single invocation should produce a coherent hygiene report. Splitting into three commands would force users to learn three names and remember to run all three. The skill body in `SKILL.md` orchestrates the three auditors as steps; each `auditors/*.md` documents one check in isolation.

Chosen over: three separate skills (poor ergonomics); one skill, inline auditors (couples the checks tightly and resists adding a fourth).

### Decision 4: Living specs use `skill-` prefix

The presentation app's specs (`presentation-content`, `presentation-shell`) carry no prefix. Adopting `skill-*` for skill-related capabilities makes the kind obvious at a glance, prevents future name collisions with non-skill capabilities, and signals that the spec describes a skill body's requirements rather than a product capability.

This is a new convention introduced by this change. Existing specs are not renamed.

### Decision 5: Each `SKILL.md` carries explicit "generic across repos" framing in its frontmatter

The most common failure mode for a skill written from one project's lessons is binding to that project's paths and naming. Each `SKILL.md` here explicitly states "this skill names file categories, not paths" and includes a self-check at the top: "if you're about to write a path from a specific repo, stop — name the category instead."

This puts the discipline in the skill itself, not in a separate authoring guide.

### Decision 6: `skills/README.md` documents graduation criteria up front

Without explicit criteria, "temporary home" becomes "permanent home by inertia." The README states the criteria:

- A skill graduates out of `openspec-llm` when **any** of:
  - It accumulates more than three contributing authors → move to a shared org skills repo.
  - It needs CI of its own (e.g. tests against fixture repos) → move to a dedicated plugin repo.
  - Its scope expands beyond the spec-driven-development context → move to a domain-specific repo.
- Graduation means: copy the skill to its new home, update any references, leave a stub `<skill-name>/MOVED.md` here pointing at the new location for at least one release cycle.

### Decision 7: This change does NOT couple to `harden-opsx-workflow`

The two changes can ship in either order. This change uses the existing workflow rules — proposal/design/specs/tasks as they exist today — so it doesn't depend on the new rules from `harden-opsx-workflow`. If `harden-opsx-workflow` lands first, this change's artifacts will be re-validated under the new rules; nothing in this change should be invalidated by that.

## Risks / Trade-offs

- **Temporary home becomes permanent** → mitigate via the explicit graduation criteria in `skills/README.md` and an `## Open questions` section in each `SKILL.md` flagging when graduation would be appropriate. Schedule a 6-month review.
- **Authors conflate `skills/` and `.claude/skills/` boundaries** → mitigate via the README's first paragraph distinguishing them and via path-based naming in any future cross-references.
- **Skill content drifts from real-world practice** → mitigate via the living specs + drift monitor; concrete changes to either skill must come through a new OpenSpec change with delta specs.
- **Two skills is a small sample** → accept. The README's graduation criteria handle the "too small to need a folder convention" objection — if the folder never accumulates a third skill, that's a signal the convention was overkill and a future change can consolidate.
- **`service-config-drift`'s three auditors may not cover all relevant drift cases** → accept for v1. Adding a fourth auditor is a future change with its own delta spec; the skill body's step list is the explicit extension point.
- **The skills are documentation today, not executable** → accept. Skills in Claude Code are interpreted by the agent; making them executable would be premature optimization. If a skill earns CI, that's a graduation signal.

## Context

This repo currently maintains three parallel copies of opsx workflow content
under `.claude/`, `.codex/`, and `.cursor/`, plus a fourth Claude-only set
under `.claude/skills/`. Investigation against upstream OpenSpec
(`Fission-AI/OpenSpec` v1.2.0) found that `openspec init` only writes
per-tool *commands* (e.g. `.claude/commands/opsx/<id>.md`); the
`.claude/skills/openspec-*/` and `.codex/skills/` / `.cursor/skills/` trees in
this repo were hand-authored on top of upstream and have drifted by up to 115
lines for a single skill. The upstream generator targets ~24 tools from a
single template set — we want the same shape, but scoped to the three tools
we use and with our local customizations (auto-review on apply, ambiguity
contract, RAD-ticket archiving, custom workflows `plan`/`pr`/`refine`/`review`/
`suggest`/`summarize`, `code-review` helper).

## Goals / Non-Goals

**Goals:**
- One canonical Markdown body per workflow under `templates/opsx/`.
- One small Node generator (`bin/opsx-sync`) that fans out to Claude, Cursor,
  Codex command paths using per-tool adapters.
- CI gate that fails any PR where templates and generated outputs diverge.
- `code-review` reachable from all three tools (fixes apply auto-review on
  codex/cursor).
- Survival of `openspec update`: `openspec update && bin/opsx-sync` puts the
  repo back into a known state without losing customizations.

**Non-Goals:**
- Distribution as an npm package or Claude Code plugin for *other* repos —
  next phase.
- Re-adopting upstream's `sync` / `verify` workflows — explicitly dropped.
- Supporting more than 3 tools — Claude, Cursor, Codex only.
- Replacing or vendoring the upstream `openspec` CLI — we layer on top.
- Auto-merging upstream template changes into our templates — that stays a
  manual review step (run `openspec update`, diff, port deltas into
  `templates/opsx/<id>.md` by hand).

## Decisions

### 1. Templates live at repo root, not under `openspec/`

`templates/opsx/<id>.md` rather than `openspec/templates/opsx/...`. The
`openspec/` directory is owned by the upstream CLI's expectations (config,
changes, specs); putting our generator's source there risks future
collisions when upstream evolves. `templates/` is a familiar top-level for
codegen sources.

**Alternative considered:** `tools/opsx/templates/`. Rejected as more nested
than needed — there's exactly one generator and one source layer.

### 2. Generator is a Node script, not a shell script

`bin/opsx-sync` written in TypeScript (or plain JS) and run via Node. Reasons:
(a) the repo already has Node available for the presentation app, (b) the
per-tool frontmatter shape varies and string-rewriting in shell is fragile,
(c) future port to an npm package (next phase) is a no-op if it's already
Node.

**Alternative considered:** Shell script with `sed` adapters. Rejected for
fragility around YAML frontmatter.

### 3. Generator is plain copy + per-tool frontmatter rewrite, not a template language

The canonical template file is itself a fully-valid Claude command file. The
generator's only transformations per tool are: (a) rewrite frontmatter shape
(field names, casing), (b) rewrite the filename (`apply.md` →
`opsx-apply.md` for flat-layout tools), (c) prepend the
`<!-- generated from ... -->` banner. No Mustache, no Handlebars, no
conditional includes.

**Rationale:** the four shared workflows are 80%+ identical body text across
tools today; the differences are frontmatter. Keeping the transformation
shallow keeps the templates readable as-is in any of the three tools and
makes the generator trivial to audit.

**Alternative considered:** Mustache or EJS templating with per-tool blocks.
Rejected — overkill for the actual variability, and obscures the canonical
content.

### 4. Claude is the canonical body source for shared workflows

Where today's `.claude/commands/opsx/<id>.md` and
`.codex/skills/openspec-<id>/SKILL.md` differ, the Claude version is the
*starting point* for `templates/opsx/<id>.md`, because (a) it is consistently
the longer/more-detailed version (e.g., pr 218L vs 94L; apply has the
ambiguity contract), and (b) the codex/cursor extras (auto-review step, RAD
ticketing, hooks) are short and easy to merge in. The merge work happens
once during implementation and is captured in the proposal's
`## Legacy preservation` section.

**Alternative considered:** Picking codex/cursor as canonical (since they're
closer to upstream OpenSpec shape). Rejected — would lose the Claude
extensions that are larger in volume.

### 5. Codex commands match upstream placement at `$CODEX_HOME/prompts/` (global)

The Codex adapter SHALL write generated commands to
`${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<id>.md`, matching what upstream
`openspec init` already produces. The generator resolves the path at run
time; nothing under `.codex/commands/` is written.

**Trade-off accepted:** Codex's generated outputs do not live in the repo,
so the drift-check gate cannot verify them in CI. The check covers Claude
and Cursor outputs only; Codex stays in sync via the recipe
`openspec update && bin/opsx-sync` run locally.

**Alternative considered:** Write Codex commands to a project-local
`.codex/commands/` directory so they travel with the repo and are
CI-checkable. Rejected per planner direction to match upstream behavior;
Codex users get the same layout regardless of which repo they're in, and we
avoid documenting a per-tool exception.

**Implication:** Codex users who had previously run `openspec init` already
have stale `~/.codex/prompts/opsx-*.md` files. Re-running `bin/opsx-sync`
overwrites them in place; no manual cleanup needed.

### 6. Skill auto-invocation is preserved by carrying the rich description through to commands

Per the Claude Code docs, slash commands and skills are functionally
equivalent — both expose `/opsx:<id>` and both can be auto-invoked by Claude
when the user's intent matches their `description:` frontmatter. Today's
`.claude/skills/openspec-*/SKILL.md` files have rich, auto-invocation-tuned
descriptions ("Use when the user wants to start implementing…"), while the
parallel `.claude/commands/opsx/<id>.md` files have terser title-style
descriptions ("Implement tasks from an OpenSpec change (Experimental)").

The canonical template MUST carry the rich, auto-invocation-tuned
`description:` field. The Claude adapter MUST write it through verbatim into
the generated command's frontmatter. Result: collapsing to command-only form
removes the within-Claude drift source AND preserves auto-invocation
behavior — no functionality is dropped.

**Alternative considered:** Keep `.claude/skills/` and also generate it from
templates. Rejected because it doubles per-template output for one tool only
and re-creates the dual-shape complexity we're escaping, while delivering no
behavioral benefit over the rich-description approach.

**Note on Codex and Cursor:** neither tool has an equivalent of Claude's
description-driven auto-invocation; they route via slash commands only. The
rich `description:` still serves as documentation in those generated files.

### 7. Drift-check uses a plain GitHub Actions `.yml`, not a gh-aw `.md`

The drift check is mechanical: run the generator, run `git diff`, fail on
non-empty. No LLM reasoning needed (unlike the existing spec-drift-monitor,
which has to read prose to decide what counts as drift). Use a standard
Actions workflow.

**Alternative considered:** gh-aw to match the existing `spec-drift-monitor.md`
shape. Rejected — overkill and slower to run for a deterministic check.

## Delivery shape

- **PR shape**: one PR. Scope is bounded (one new generator, one CI workflow,
  one templates dir, deletion of three legacy trees). Splitting would force
  the CI gate to land before generated content, leaving a broken interim
  state.
- **Base branch**: `main`.
- **Repo merge-method**: `squash` (confirmed via repo settings — recent
  merges in `git log` use squash-style commits). No stack, so no rebase
  recipe needed.
- **Named `/opsx:*` invocations per boundary:**
  - propose-end: `/opsx:propose` (this run)
  - capability-start: `/opsx:apply single-source-opsx-templates`
  - capability-end: `/opsx:review` then `/opsx:pr`
  - archive: `/opsx:archive single-source-opsx-templates` (after merge)

## Risks / Trade-offs

- **[Risk] Loss of Claude skill auto-invocation** → Mitigation: the slash-
  command entrypoint covers every workflow today, and any contributor relying
  on auto-invocation is producible (we explicitly removed it). Document in
  README and in the PR body.
- **[Risk] Codex's generated outputs live outside the repo at
  `~/.codex/prompts/opsx-*.md` and cannot be verified by the CI drift-check
  gate** → Mitigation: documented as a known scope gap in `templates/opsx/README.md`;
  contributors who edit a template are responsible for re-running
  `bin/opsx-sync` locally before commit, and the Claude/Cursor checks catch
  the most common forgetfulness path. Local `bin/opsx-sync --check` always
  includes Codex.
- **[Risk] `openspec update` could introduce upstream changes to shared
  workflows that we miss porting** → Mitigation: documented recipe always
  runs `bin/opsx-sync` last so upstream's regenerated commands are
  overwritten; absorbing upstream improvements is a deliberate manual step.
- **[Trade-off] Per-tool frontmatter adapters add code complexity** vs.
  perfect cross-tool uniformity. Accepted — three adapters with ~10 lines
  each is cheaper than enforcing identical frontmatter on three tools that
  expect different fields.
- **[Risk] Drift-check fails on whitespace-only differences (line endings,
  trailing newlines) confusing contributors** → Mitigation: the generator
  always writes LF line endings and exactly one trailing newline; the diff
  output in CI quotes the offending bytes.

## Open Questions

- Whether to commit the generated outputs (`.claude/commands/opsx/...`) to
  git or `.gitignore` them and regenerate on every CI run. **Recommendation:**
  commit them so PRs are reviewable end-to-end and contributors see the
  rendered output, matching how `openspec/specs/` already works. Drift-check
  enforces freshness either way.
- Whether `code-review` should remain a separately-named workflow
  (`opsx-code-review`) or be folded into the `review` workflow as a sub-mode.
  **Recommendation:** keep separate — `review` is human-facing audit, `code-
  review` is the automated gate. Different invocation contexts.

## Decisions made without consultation

- **Generator language: TypeScript** rather than JavaScript. Alternative:
  plain JS. Rationale: rest of the repo's app code (`apps/presentation`) is
  TS; consistent toolchain.
- **CI workflow path: `.github/workflows/opsx-template-drift.yml`**.
  Alternative: extend the existing `spec-drift-monitor.md`. Rationale: keeps
  the mechanical check separate from the LLM-driven spec drift monitor;
  faster CI feedback.
- **Templates filename style: `<id>.md` matching Claude's nested layout**
  (e.g., `apply.md` not `opsx-apply.md`). Alternative: `opsx-<id>.md` flat
  matching Cursor/Codex. Rationale: Claude is the canonical body source per
  Decision 4; matching its filename keeps the diff between template and
  Claude output near-zero.

Starting state: brownfield
Cutover: in-place
Ticket: RAD-75634

## Why

The opsx workflow files in this repo have drifted across three AI tool trees
(`.claude/`, `.codex/`, `.cursor/`) because each tool's files are
hand-maintained independently. Root-cause investigation found three drift
sources: (1) within Claude itself we maintain both `.claude/commands/opsx/*.md`
and `.claude/skills/openspec-*/SKILL.md` for the same workflow and they have
diverged by up to 115 lines for a single skill; (2) our `apply/archive/explore/
propose` files are patched versions of upstream OpenSpec but `.codex/` and
`.cursor/` were edited on different occasions than `.claude/`; (3) the
`code-review` helper exists only under `.claude/skills/` even though the apply
auto-review step (which lives in `.codex/` and `.cursor/` too) tries to invoke
it — codex and cursor users hit a dead end. Without a single source of truth
and a drift-check gate, every future edit risks re-introducing the same
inconsistency.

## What Changes

- **Introduce canonical template directory** `templates/opsx/` containing one
  Markdown file per workflow. This is the single source the three tool-specific
  trees are generated from.
- **Add generator** `bin/opsx-sync` (Node script) that reads `templates/opsx/`
  and writes the tool-specific outputs:
  - `.claude/commands/opsx/<id>.md` (nested folder, no prefix)
  - `.cursor/commands/opsx-<id>.md` (flat, hyphen prefix)
  - `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<id>.md` (global, matches
    upstream `openspec init` placement)
  Generated files include a `<!-- generated from templates/opsx/<id>.md — do
  not edit -->` banner.
- **Add CI drift-check gate** at `.github/workflows/opsx-template-drift.yml`
  that runs `bin/opsx-sync` and fails on any `git diff`, in the shape of the
  existing spec-drift-monitor.
- **Promote `code-review` to all three tools.** Currently `.claude/skills/code-review/SKILL.md`
  only. After this change: a `templates/opsx/code-review.md` template fans out
  alongside the workflows. The apply auto-review step works for codex/cursor
  users.
- **Remove the parallel `.claude/skills/openspec-*`, `.codex/skills/`, and
  `.cursor/skills/` trees** entirely. Upstream `openspec init` does not
  generate these; they were a hand-authored second canonical location and are
  the within-Claude drift source. The 10 workflows live as commands only,
  matching upstream's shape. Auto-invocation in Claude is preserved: each
  canonical template carries a rich, auto-invocation-tuned `description:`
  field which the Claude adapter writes verbatim into the generated command
  file — Claude continues to auto-route when context matches.
- **Drop `sync` and `verify` workflows** that upstream OpenSpec ships — these
  were never in this repo and we are explicitly not re-adopting them.
- **Final canonical workflow set (10):** `apply`, `archive`, `explore`,
  `plan`, `pr`, `propose`, `refine`, `review`, `suggest`, `summarize`, plus
  the `code-review` helper.
- **Survival of `openspec update`:** when upstream releases a new version, the
  documented recipe is `openspec update && bin/opsx-sync` — the second command
  re-applies our patched templates over upstream's regenerated commands.
  Upstream changes we want to absorb are merged into `templates/opsx/<id>.md`
  manually.

## Capabilities

### New Capabilities
- `opsx-template-sync`: Single-source canonical templates for opsx workflows
  under `templates/opsx/`, the `bin/opsx-sync` generator that fans them out to
  Claude/Codex/Cursor command paths, and the CI drift-check gate that fails
  any diff between source templates and generated outputs.

### Modified Capabilities
<!-- None. opsx-workflow, opsx-plan-command, and related capabilities describe
WHAT the workflows do, not WHERE the files live. The behavior of each
workflow is unchanged by this change — only its storage location and
generation mechanism. -->

## Impact

- `templates/opsx/` (new) — 10 workflow templates + 1 `code-review.md` template.
- `bin/opsx-sync` (new) — Node generator script with per-tool path/format adapters.
- `.claude/commands/opsx/*.md` — regenerated from templates; `plan.md`,
  `refine.md`, `pr.md`, `review.md`, `suggest.md`, `summarize.md` were already
  Claude-only and will now also fan out to codex/cursor.
- `.cursor/commands/opsx-*.md` — regenerated; gains `plan`, `refine`, `code-review`.
- `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-*.md` — written to the user's
  global Codex prompts dir, matching upstream `openspec init` placement.
  These files live outside the repo and are NOT covered by the CI drift gate
  (documented limitation).
- `.claude/skills/openspec-*/`, `.codex/skills/`, `.cursor/skills/` — **DELETED**.
- `.claude/skills/code-review/SKILL.md` — **DELETED** (replaced by generated
  command at `.claude/commands/opsx/code-review.md`).
- `.github/workflows/opsx-template-drift.yml` (new) — gh-aw drift monitor.
- `README.md` — section update describing the canonical-templates + generator
  workflow and the `openspec update && bin/opsx-sync` recipe.
- `package.json` — add `bin/opsx-sync` entry and any deps the generator uses
  (likely none beyond Node stdlib + `js-yaml` if needed for frontmatter).

## Non-code surfaces

- **Config load mechanics**: N/A — generator reads templates from disk via
  relative paths; no env overlay, no ConfigMap, no deploy-time substitution.
- **Secret sources**: N/A — no secrets consumed.
- **Container/deploy artifacts**: N/A — this is a dev-time tooling change;
  nothing runs in a container.
- **CI workflow scripts**: Adds `.github/workflows/opsx-template-drift.yml`
  (gh-aw workflow). Pattern mirrors the existing `spec-drift-monitor.md`. No
  changes to existing lint/test/build jobs.
- **Observability endpoints**: N/A — no runtime service.

## Out of scope

Publishing this as an installable npm package or Claude Code plugin for
*other* repos to consume. That is the next phase. This change consolidates
within this repo only.

## Legacy preservation

For each in-scope legacy file, the canonical template MUST preserve the union
of behaviors currently present across the three tool trees (`.claude/`,
`.codex/`, `.cursor/`) for that workflow. The merge rule applies to the four
shared workflows where drift exists today:

- **`apply`** (templates/opsx/apply.md): MUST preserve (a) the
  auto-review-on-completion step currently in `.codex/skills/openspec-apply-change/SKILL.md`
  and `.cursor/skills/openspec-apply-change/SKILL.md` that invokes `code-review`
  when all task checkboxes are `[x]`; (b) the ambiguity-escalation contract
  (must-ask / may-decide classes) currently in `.claude/commands/opsx/apply.md`
  and `.claude/skills/openspec-apply-change/SKILL.md`. May diverge: nothing —
  union of both branches is required.
- **`propose`** (templates/opsx/propose.md): MUST preserve (a) the legacy
  gap-analysis pre-pass currently in `.claude/commands/opsx/propose.md` and
  `.claude/skills/openspec-propose/SKILL.md` (the "for each legacy file,
  prompt for preservation" pre-pass that gates `specs/` generation); (b) the
  ambiguity-escalation contract. May diverge: nothing.
- **`archive`** (templates/opsx/archive.md): MUST preserve (a) the RAD ticket
  extraction from branch name + ticket-scoped archive subfolder
  (`openspec/changes/archive/<TICKET>/<change-name>/`) currently in
  `.codex/skills/openspec-archive-change/SKILL.md` and
  `.cursor/skills/openspec-archive-change/SKILL.md`; (b) the post-archive
  hooks block driven by `openspec/config.yaml` `hooks.post-archive`. May
  diverge: the Claude-only variant's plain `mkdir -p openspec/changes/archive`
  flow is superseded.
- **`explore`** (templates/opsx/explore.md): no functional drift between the
  three trees — identical bodies modulo frontmatter. Merge trivially.
- **`plan`, `refine`** (Claude-only today): MUST preserve current Claude
  content exactly. The fan-out to codex/cursor is the only new behavior; no
  existing behavior is dropped.
- **`pr`, `review`, `suggest`, `summarize`** (longer in Claude than in
  codex/cursor by 30–124 lines): MUST preserve the Claude-side content as the
  canonical body. The shorter codex/cursor versions are superseded — no
  behavior unique to them needs preservation (verified by line-level diff:
  shorter files contain a strict subset of the Claude content).
- **`code-review`** (Claude-only `.claude/skills/code-review/SKILL.md`
  currently): MUST preserve current content exactly. Promoted from skill to
  command form and fanned out to all three tools.

The merge result is captured per-workflow inside each `templates/opsx/<id>.md`
file at implementation time; this section establishes the contract.


## ADDED Requirements

### Requirement: Canonical templates directory SHALL be the single source for opsx workflow content

The repository SHALL maintain exactly one Markdown file per opsx workflow under
`templates/opsx/`. The canonical workflow set is: `apply`, `archive`, `explore`,
`plan`, `pr`, `propose`, `refine`, `review`, `suggest`, `summarize`, plus the
`code-review` helper. No other location in the repository SHALL contain
hand-authored opsx workflow bodies.

Brownfield precedence: when scenario wording conflicts with a directive to
"match legacy `<file>` exactly," the legacy code is authoritative.

#### Scenario: Workflow body authored outside templates/opsx
- **WHEN** a contributor edits `.claude/commands/opsx/<id>.md`,
  `.cursor/commands/opsx-<id>.md`, or `.codex/commands/opsx-<id>.md` directly
- **THEN** the CI drift-check gate SHALL fail the build, naming the
  out-of-sync file(s) and instructing the contributor to edit
  `templates/opsx/<id>.md` and re-run `bin/opsx-sync`

#### Scenario: Workflow not in canonical set is requested
- **WHEN** a contributor adds a new `templates/opsx/<id>.md` for a workflow
  not in the canonical list (e.g., re-introducing `sync` or `verify` from
  upstream)
- **THEN** the addition is treated as a normal change requiring an OpenSpec
  proposal that updates this requirement's canonical list

### Requirement: Canonical templates SHALL carry rich auto-invocation descriptions

Every `templates/opsx/<id>.md` SHALL declare a `description:` frontmatter
field written in the auto-invocation style (e.g. "…Use when the user wants
to <intent>."). The Claude adapter SHALL write this description verbatim
into the generated command file so Claude's auto-invocation behavior is
preserved without the legacy `.claude/skills/` tree.

#### Scenario: Template description is terse or title-style
- **WHEN** a `templates/opsx/<id>.md` declares a description shorter than
  fifty characters or lacking a "Use when" trigger phrase
- **THEN** `bin/opsx-sync --check` SHALL warn (non-fatal) so authors notice
  before Claude's auto-routing degrades

#### Scenario: Claude auto-invokes a workflow after migration
- **WHEN** a user describes their intent in language that matches a
  template's auto-invocation description (e.g. "let's start implementing
  this change")
- **THEN** Claude SHALL be able to invoke the generated slash command
  automatically, equivalent to the pre-migration `.claude/skills/` behavior

### Requirement: `bin/opsx-sync` SHALL fan templates out to per-tool command paths

The generator `bin/opsx-sync` SHALL read every file in `templates/opsx/` and
write one tool-specific output file per (template × supported tool)
combination. The supported tools are exactly: Claude Code, Cursor, Codex.

The output paths and filename conventions SHALL match each tool's expected
layout:

- **Claude Code**: `.claude/commands/opsx/<id>.md` (nested folder, no prefix)
- **Cursor**: `.cursor/commands/opsx-<id>.md` (flat directory, hyphen prefix)
- **Codex**: `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<id>.md` (global,
  matches upstream `openspec init` placement). The path SHALL be resolved at
  generator run time; the generator SHALL NOT write a project-local
  `.codex/` directory for commands.

Every generated file SHALL begin with a banner comment of the form
`<!-- generated from templates/opsx/<id>.md — do not edit -->` so manual
editors are warned.

#### Scenario: Adding a new workflow template
- **WHEN** a contributor adds `templates/opsx/<new-id>.md` and runs `bin/opsx-sync`
- **THEN** three new files are written — `.claude/commands/opsx/<new-id>.md`,
  `.cursor/commands/opsx-<new-id>.md`, and
  `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<new-id>.md` — each prefixed
  with the generated-from banner

#### Scenario: Removing a workflow template
- **WHEN** a contributor deletes `templates/opsx/<id>.md` and runs `bin/opsx-sync`
- **THEN** the corresponding files in `.claude/commands/opsx/`,
  `.cursor/commands/`, and `${CODEX_HOME:-$HOME/.codex}/prompts/` are
  deleted in the same run

#### Scenario: Per-tool frontmatter differences
- **WHEN** the generator writes a file for a tool whose frontmatter shape
  differs from the canonical template (for example, a tool that requires a
  `category:` field)
- **THEN** the generator applies a per-tool frontmatter adapter so the output
  is valid for that tool while the canonical template stays tool-agnostic

### Requirement: CI drift-check gate SHALL block merges when generated outputs are stale

A CI workflow SHALL run `bin/opsx-sync --check` (Claude + Cursor scopes
only, since Codex outputs live outside the repo at the user's global
`$CODEX_HOME/prompts/`) and fail the build if any committed file under
`.claude/commands/opsx/` or `.cursor/commands/` differs from what the
generator would produce. The check SHALL run on every pull request and on
pushes to `main`. The Codex scope SHALL still run when `bin/opsx-sync` is
executed locally so contributors keep their global prompts in sync; CI
simply cannot verify that side.

The check SHALL print the exact `git diff` so the contributor can see what
needed to change, and SHALL include a one-line remediation instruction:
`Run bin/opsx-sync locally and commit the result.`

#### Scenario: PR edits template but forgets to regenerate
- **WHEN** a contributor edits `templates/opsx/apply.md` and opens a PR
  without running `bin/opsx-sync`
- **THEN** the drift-check job SHALL fail, print the diff between the
  generator's output and the committed files, and instruct the contributor
  to run the generator locally

#### Scenario: PR edits a generated file directly
- **WHEN** a contributor edits `.claude/commands/opsx/apply.md` directly
  without touching the template
- **THEN** the drift-check job SHALL fail because regeneration would revert
  the edit, surfacing the same diff and remediation instruction

### Requirement: Legacy skill trees SHALL be removed and SHALL NOT return

This change SHALL delete the legacy skill directories under
`.claude/skills/openspec-*/`, `.codex/skills/`, and `.cursor/skills/`. The
`.claude/skills/code-review/SKILL.md` file SHALL also be deleted; the
`code-review` helper is reborn as a command-form template at
`templates/opsx/code-review.md`. The CI drift-check gate SHALL fail any pull
request that re-introduces one of these in-repo legacy locations for a
canonical workflow name. (The Codex global path is a separate scope and is
not affected by this requirement.)

#### Scenario: Legacy skill folder re-appears
- **WHEN** a PR adds `.claude/skills/openspec-apply-change/SKILL.md` or any
  `.codex/skills/openspec-*/SKILL.md` / `.cursor/skills/openspec-*/SKILL.md`
- **THEN** the drift-check job SHALL fail and instruct the contributor to
  edit `templates/opsx/<id>.md` instead

### Requirement: `code-review` SHALL be available to Claude, Codex, and Cursor users

The `code-review` helper SHALL be generated to all three supported tools so
that the `apply` workflow's auto-review-on-completion step succeeds regardless
of which tool the user is running. The template SHALL live at
`templates/opsx/code-review.md` and be fanned out by `bin/opsx-sync` using
the same per-tool path conventions as the other workflows.

#### Scenario: Codex user finishes apply
- **WHEN** a Codex user completes all tasks in a change and `apply` triggers
  its auto-review step
- **THEN** the `code-review` command SHALL be invocable from
  `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-code-review.md` and the review
  SHALL complete in-tool without a dead-end "skill not found" failure

### Requirement: `openspec update` SHALL be safely re-runnable

The documented recipe `openspec update && bin/opsx-sync` SHALL leave the
repository in a state where `bin/opsx-sync` has overwritten any upstream
regeneration of `.claude/commands/opsx/<id>.md` etc., so customizations
defined in `templates/opsx/` are preserved.

#### Scenario: Upstream releases a new OpenSpec version
- **WHEN** a contributor runs `openspec update` followed by `bin/opsx-sync`
- **THEN** the generated command files reflect the contents of
  `templates/opsx/*.md`, not the upstream defaults; any upstream change a
  contributor wishes to absorb SHALL be merged into the relevant template
  file manually

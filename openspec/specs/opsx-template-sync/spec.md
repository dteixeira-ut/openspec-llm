# opsx-template-sync Specification

## Purpose
Single source of truth for opsx workflow content. The repository maintains
exactly one Markdown file per opsx workflow under `templates/opsx/`, and a
generator (`bin/opsx-sync`) fans them out to per-tool command paths for
Claude Code, Cursor, and Codex. A CI drift-check gate enforces that
generated outputs match their canonical templates.

## Requirements

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

The repository SHALL NOT contain the legacy skill directories
`.claude/skills/openspec-*/`, `.codex/skills/`, or `.cursor/skills/`. The
`code-review` helper lives at `templates/opsx/code-review.md`
and is fanned out as a command, not as a Claude-only skill. The CI
drift-check gate SHALL fail any pull request that re-introduces one of
these in-repo legacy locations for a canonical workflow name. (The Codex
global path is a separate scope and is not affected by this requirement.)

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

### Requirement: Canonical templates SHALL be authored in tool-agnostic prose

Every `templates/opsx/<id>.md` SHALL describe its procedural steps in plain
prose that any AI tool's model can execute, not in references to
Claude-specific tool names. Direct references to `AskUserQuestion`,
`TodoWrite`, `ScheduleWakeup`, or `Skill tool` SHALL NOT appear in the
template body outside of HTML-comment affordance hints. Cursor and Codex
users SHALL receive the same procedural behavior as Claude users when a
template is invoked.

Brownfield precedence: when the rewrite must choose between matching
legacy Claude-shaped wording and producing portable prose, the portable
prose wins. The procedural logic itself is authoritative and SHALL be
preserved exactly.

#### Scenario: Author writes a Claude-specific tool reference in a template
- **WHEN** a contributor edits `templates/opsx/<id>.md` and adds a literal
  reference to a Claude-specific tool name (`AskUserQuestion`, `TodoWrite`,
  `ScheduleWakeup`, or `Skill tool`) in the body outside an HTML-comment
  affordance hint
- **THEN** `bin/opsx-sync --check` SHALL emit a non-fatal warning naming
  the template and line, so the author replaces the reference with
  tool-agnostic prose before merging

#### Scenario: Cursor or Codex user invokes a template that was previously Claude-flavored
- **WHEN** a Cursor or Codex user invokes one of the rewritten workflows
  (`apply`, `archive`, `plan`, `pr`, `propose`, `refine`, `suggest`)
- **THEN** the model SHALL execute the same procedural steps as Claude
  using its own native affordances, without dead-end references to tools
  it does not have

### Requirement: HTML-comment Claude affordance hints SHALL be the only Claude-specific surface

Templates SHALL express Claude-specific routing only through HTML-comment
affordance hints, in one of two shapes:

1. **Single-line hint** for discrete-option AskUserQuestion calls:
   `<!-- Claude affordance: use AskUserQuestion with options=[A, B] -->`
   placed immediately above the tool-agnostic prose for that step.

2. **Block-level hint** for multi-step Claude-only sub-flows that have a
   working tool-agnostic fallback. Form: an HTML comment that opens with
   `<!-- Claude affordance: <short name>` on its own line, contains the
   Claude-only instructions, and closes with `-->` on its own line.

In both shapes, the prose immediately following the hint MUST be a
valid, executable step on its own for Cursor and Codex — affordance
hints augment cross-tool prose, they SHALL NOT replace it. Hints SHALL
NOT be used for `TodoWrite`, `Skill tool`, or free-form (open-ended)
questions; those cases have no material Claude advantage worth signaling
and are covered fully by tool-agnostic prose. A block-level hint SHALL
NOT appear without a tool-agnostic fallback immediately below it.

#### Scenario: Discrete-option question with single-line Claude hint
- **WHEN** a template step asks the user to choose between a fixed set of
  options
- **THEN** the template SHALL place a single-line hint immediately above
  the prose, and Claude SHALL route to its structured-option UI while
  Cursor and Codex render the question inline

#### Scenario: Multi-step Claude-only sub-flow with block-level hint
- **WHEN** a template step has a Claude-only enhancement (such as the
  `pr.md` polling loop) AND a working subset for non-Claude tools
- **THEN** the Claude-only instructions SHALL appear inside a block-level
  affordance hint AND tool-agnostic prose describing the working subset
  SHALL appear immediately below; Claude SHALL execute both, Cursor and
  Codex SHALL execute only the prose below

#### Scenario: Block-level hint missing a tool-agnostic fallback
- **WHEN** a template contains a block-level affordance hint whose next
  non-blank line is another HTML comment or end-of-file
- **THEN** `bin/opsx-sync --check` SHALL warn naming the template and
  line, so the author adds a tool-agnostic fallback before merging

#### Scenario: Free-form question without Claude hint
- **WHEN** a template step asks an open-ended question (no fixed option
  set)
- **THEN** the template SHALL contain only the tool-agnostic prose and no
  HTML-comment hint, since the structured affordance does not apply

### Requirement: `pr.md` SHALL emit the PR URL and exit on every tool, with Claude additionally polling for reviewer response

The `pr.md` workflow SHALL post the AI-reviewer comment (when reviewers
are configured), emit the PR URL to the user, and tell the user the
reviewer (if configured) will respond asynchronously. This MUST be the
behavior on every supported tool.

When run by Claude specifically, the workflow SHALL ADDITIONALLY schedule
a polling loop (via `ScheduleWakeup`) to check for reviewer responses,
expressed in `pr.md` as a block-level Claude-affordance hint. The polling
loop SHALL NOT execute on Cursor or Codex. The tool-agnostic prose
covering "emit URL + monitor" SHALL appear immediately below the hint so
non-Claude tools have a working step to execute.

#### Scenario: Claude opens a PR
- **WHEN** a Claude user runs `/opsx:pr` and the PR is created successfully
- **THEN** Claude SHALL post the reviewer comment, emit the PR URL,
  schedule the polling loop, and asynchronously notify the user when a
  reviewer comment is detected

#### Scenario: Cursor or Codex opens a PR
- **WHEN** a Cursor or Codex user runs `/opsx:pr` and the PR is created
  successfully
- **THEN** the workflow SHALL post the reviewer comment, emit the PR URL,
  print a one-line monitoring instruction, and end — with no further
  automatic check-ins (the polling-loop hint is inert for these tools)

#### Scenario: No reviewers configured
- **WHEN** `agents.pr-reviewers` is empty or missing from `openspec/config.yaml`
- **THEN** the workflow SHALL skip the reviewer-comment step and warn the
  user that no AI reviewer was mentioned, but SHALL still emit the PR URL
  and exit cleanly on every tool

### Requirement: `bin/opsx-sync --check` SHALL warn on Claude-isms in template bodies

The generator SHALL scan each template body in `templates/opsx/` for
literal Claude-specific tool names (`AskUserQuestion`, `TodoWrite`,
`ScheduleWakeup`, `Skill tool`) and SHALL emit a non-fatal warning when
any match is found outside an HTML-comment affordance hint. The warn
SHALL name the template file and the matching line. The check SHALL NOT
exit non-zero on warnings; it is a quality signal, not a gate.

#### Scenario: Template body contains a Claude-only tool name
- **WHEN** `bin/opsx-sync --check` runs against a template whose body
  contains the literal string `AskUserQuestion` outside an HTML-comment
  hint
- **THEN** the generator SHALL print `WARN: templates/opsx/<id>.md:<line>:
  Claude-specific tool reference 'AskUserQuestion' — replace with
  tool-agnostic prose` and continue, exiting with the same status it
  would have used had the warning not fired

#### Scenario: Claude-specific name appears inside an HTML-comment hint
- **WHEN** the literal string appears inside a recognized affordance hint
  (`<!-- Claude affordance: ... -->`)
- **THEN** the generator SHALL NOT warn for that occurrence

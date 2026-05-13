## ADDED Requirements

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

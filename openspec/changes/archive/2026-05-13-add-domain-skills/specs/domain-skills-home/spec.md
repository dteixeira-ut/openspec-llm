## ADDED Requirements

### Requirement: Repo SHALL contain a top-level `skills/` directory for domain skills

The repository SHALL contain a directory at `skills/` (sibling to `apps/`, `openspec/`, `.claude/`) hosting domain skills that are not part of the OpenSpec workflow itself.

#### Scenario: Skills directory present
- **WHEN** the change is merged
- **THEN** `skills/` SHALL exist at the repo root and SHALL contain `README.md` plus at least one skill subdirectory

#### Scenario: Concern boundary preserved
- **WHEN** a new skill is added that is part of the OpenSpec workflow itself (consumed by `/opsx:*` commands or required for the workflow to operate)
- **THEN** the skill SHALL be placed under `.claude/skills/` and NOT under `skills/`

### Requirement: `skills/README.md` SHALL document the temporary-home framing

The `skills/README.md` SHALL document (a) the rationale for hosting domain skills in this repo, (b) the concern boundary between `skills/` and `.claude/skills/`, (c) authoring conventions, (d) explicit graduation criteria, and (e) what graduation means procedurally.

#### Scenario: Authoring conventions documented
- **WHEN** a contributor opens `skills/README.md`
- **THEN** they SHALL find an explicit statement that each skill names file categories rather than paths from any specific repo, plus the per-skill layout convention (`SKILL.md` entry point + named ancillary subfolders)

#### Scenario: Graduation criteria documented
- **WHEN** a contributor opens `skills/README.md`
- **THEN** they SHALL find a list of triggers that promote a skill out of this repo (multi-author contribution, CI needs, scope expansion) and the procedure (copy to new home, leave `MOVED.md` stub for one release cycle)

### Requirement: Each skill under `skills/` SHALL follow the standard layout

Every subdirectory under `skills/` SHALL contain a `SKILL.md` file as the entry point and SHALL place ancillary content (recipes, auditors, examples) under named subdirectories.

#### Scenario: Skill discovery
- **WHEN** an agent is asked to invoke a domain skill named `<skill-name>`
- **THEN** the agent SHALL read `skills/<skill-name>/SKILL.md` as the authoritative entry point

#### Scenario: Ancillary content organization
- **WHEN** a skill includes content beyond its main body (e.g. recipes, auditors, example fixtures)
- **THEN** that content SHALL live under a named subdirectory of the skill (e.g. `recipes/`, `auditors/`, `examples/`) and SHALL be referenced from `SKILL.md`

### Requirement: Each `SKILL.md` SHALL declare its repo-agnostic framing

Each `SKILL.md` MUST include a self-check statement near the top indicating that the skill names file categories, not paths from any one repo.

#### Scenario: Self-check present
- **WHEN** a contributor reads any `SKILL.md` under `skills/`
- **THEN** they SHALL find an explicit "generic across repos" statement and a self-check directive instructing the author to name categories rather than paths

#### Scenario: Path-leak self-correction
- **WHEN** a contributor is about to write a path from a specific consumer repo into a skill body
- **THEN** the SKILL.md self-check SHALL direct them to name the file category instead (or to move the example into the consumer's own documentation)

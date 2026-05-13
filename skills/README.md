# Domain Skills (temporary home)

This directory hosts **domain skills** — reusable bodies of expertise that Claude Code agents can invoke against a target repo, but which are **not part of the OpenSpec workflow itself**. They live here for now, under version control, until they earn their own home.

## Why they live here

These skills were authored alongside real work in this repo (the NestJS migration of an internal service produced both `migrate-to-nestjs` and `service-config-drift`). Putting them here gives them:

- A version-controlled location with a clear story.
- Living specs under `openspec/specs/skill-*` that the spec-drift monitor watches.
- Discovery via the same conventions as the workflow skills.

This is explicitly a **temporary home**. The goal is to move each skill out when it outgrows this repo — see [Graduation](#graduation) below.

## `skills/` vs the opsx workflow templates

This folder is for **domain skills**. The opsx workflow itself (the
`/opsx:*` commands) no longer lives as Claude Code skills — it is generated
from canonical templates under `templates/opsx/`, fanned out to each tool
by `bin/opsx-sync`. The two layers exist for different reasons:

| Location | What lives here | Examples |
|---|---|---|
| `templates/opsx/` | The **opsx workflow itself** — canonical Markdown bodies for the `/opsx:*` commands, generated out to `.claude/commands/opsx/`, `.cursor/commands/`, and `$CODEX_HOME/prompts/`. | `apply`, `archive`, `propose`, `plan`, `code-review` |
| `skills/` (this folder) | **Domain skills** — consumed by agents working in any TS-service repo, but not coupled to the OpenSpec workflow. | `migrate-to-nestjs`, `service-config-drift` |

**Rule**: if a new workflow is required for `/opsx:*` to work, it belongs as a canonical template under `templates/opsx/`. Otherwise, it belongs here.

## Per-skill layout

Every subdirectory under `skills/` follows the same shape:

```
skills/<skill-name>/
  SKILL.md            # entry point — read this first
  <subdir>/           # ancillary content, organized by category
    <file>.md         # one piece per file (recipe, auditor, example, etc.)
```

Established subfolder names:

- `recipes/` — runnable procedures referenced from `SKILL.md` (e.g. `rebase-stacked-squash.md`).
- `auditors/` — individual checks composed by an orchestrating `SKILL.md` (e.g. `prettierrc-parser-plugins.md`).
- `examples/` — worked examples or fixture descriptions, if a skill needs them.

`SKILL.md` is **always** the entry point. Ancillary files are referenced from `SKILL.md` but never invoked directly.

## Authoring conventions

### 1. Name file *categories*, not paths from any one repo

The single most common failure mode for a skill written from one project's lessons is binding to that project's filenames and paths. A skill that says "edit `video-uploads-service/src/main.ts`" only works in one repo; a skill that says "edit the NestJS bootstrap file (`src/main.ts` in a flat layout, `apps/<name>/src/main.ts` in an Nx layout)" works anywhere.

Each `SKILL.md` must include a **repo-agnostic self-check** near the top stating the rule and instructing the author to stop if they're about to write a specific repo's path.

### 2. Frontmatter matches the workflow skills

Use YAML frontmatter with these fields (mirroring the convention used by the opsx workflow templates under `templates/opsx/`):

```yaml
---
name: <skill-name>
description: One-sentence trigger description (what it does, when to use it).
license: MIT
compatibility: <runtime expectations, e.g. "Repo-agnostic; expects a TS service.">
metadata:
  author: openspec-llm
  version: "1.0"
---
```

### 3. Each skill declares its own graduation triggers

In addition to the global graduation criteria below, each `SKILL.md` includes an `## Open questions` or `## Graduation` section listing the conditions specific to that skill (e.g. "graduates when a second org adopts it"). This puts the exit condition in the artifact itself, so future maintainers don't have to infer it.

### 4. Living spec required

Every skill under `skills/` has a corresponding living spec at `openspec/specs/skill-<skill-name>/spec.md`. Skill bodies are authored content; the living spec captures the **requirements** the body must satisfy. Changes to either go through OpenSpec.

## Graduation

A "temporary home" is only useful if there's a credible path out. A skill graduates out of this repo when **any** of the following are true:

| Trigger | Where it goes |
|---|---|
| More than three contributing authors across multiple teams. | Shared org skills repo. |
| Needs CI of its own (e.g. tests against fixture repos). | Dedicated plugin repo. |
| Scope expands beyond the spec-driven-development context. | Domain-specific repo (e.g. `org-nestjs-skills`). |

### Graduation procedure

1. Copy the skill's full directory (including `SKILL.md`, subfolders, and the living spec) to its new home.
2. Update any references in this repo and in known consuming repos.
3. Replace the skill folder here with a stub `MOVED.md` pointing at the new location.
4. Leave the stub in place for **at least one release cycle** so existing references don't break silently.
5. Archive the corresponding living spec when the stub is removed.

## Current inventory

- [`migrate-to-nestjs/`](./migrate-to-nestjs/SKILL.md) — procedure for migrating a TypeScript backend service to NestJS, codifying the Step 0 sibling-file inspection, foundation-first slicing, per-PR build gates, and migration-specific must-ask classes.
- [`service-config-drift/`](./service-config-drift/SKILL.md) — three auditors that catch config mismatches biting at deploy time: prettier parser plugins, Dockerfile entrypoint references, CI `fmt` gate presence.

## Open questions

- Should this folder live in `openspec-llm` long-term, or should it move out as soon as a third skill arrives? Review at the next 6-month inventory pass.
- Do we need a registry/index file in addition to this README, or is the README's inventory section enough? Defer until a third skill lands.

## Decisions made without consultation

While authoring this README:

1. Used a markdown table for the `skills/` vs `templates/opsx/` distinction rather than prose — clearer at a glance.
2. Listed established subfolder names (`recipes/`, `auditors/`, `examples/`) explicitly so future authors don't invent new ones unnecessarily; new names are allowed but should be justified in the skill's own README or commit message.
3. Set "at least one release cycle" for the `MOVED.md` stub lifetime without defining "release cycle" precisely. Concrete definition deferred until the first graduation event forces the question.

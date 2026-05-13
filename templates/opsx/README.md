# Canonical opsx workflow templates

This directory holds the **single source of truth** for every opsx workflow
in this repo. The generator `bin/opsx-sync` reads every `<id>.md` file here
and fans it out to the per-tool command locations for Claude Code, Cursor,
and Codex. The generated files start with a `<!-- generated from
templates/opsx/<id>.md — do not edit -->` banner so manual editors are
warned to come back here.

If you find yourself editing a file under `.claude/commands/opsx/`,
`.cursor/commands/`, or `${CODEX_HOME:-$HOME/.codex}/prompts/` — stop. Edit
the matching `templates/opsx/<id>.md` and re-run `bin/opsx-sync`.

## Canonical workflow set

| id | command surfaces |
|---|---|
| `apply` | `/opsx:apply` |
| `archive` | `/opsx:archive` |
| `explore` | `/opsx:explore` |
| `plan` | `/opsx:plan` |
| `pr` | `/opsx:pr` |
| `propose` | `/opsx:propose` |
| `refine` | `/opsx:refine` |
| `review` | `/opsx:review` |
| `suggest` | `/opsx:suggest` |
| `summarize` | `/opsx:summarize` |
| `code-review` | invoked by `apply` on completion |

Adding a new workflow is an OpenSpec change — see "Add a new workflow"
below.

## Template format

Each `templates/opsx/<id>.md` is a normal Markdown file with YAML
frontmatter:

```yaml
---
id: apply
title: Apply
description: Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue implementation, or work through tasks.
category: Workflow
tags: [workflow, artifacts, experimental]
---
```

Frontmatter contract:

- **`id`** (required) — the workflow short id; must match the filename
  stem (`apply.md` → `id: apply`).
- **`title`** (required) — human title used by the Claude adapter to build
  the `name: "OPSX: <title>"` line.
- **`description`** (required) — rich auto-invocation text. Write it in the
  "…Use when the user wants to <intent>." shape. Claude's auto-invocation
  routes on this string, so terse title-style descriptions degrade routing.
  `bin/opsx-sync --check` warns when a description is shorter than 50
  characters or lacks a "Use when" trigger phrase.
- **`category`** (optional) — surfaces in tooling UIs; default `Workflow`.
- **`tags`** (optional) — surfaces in tooling UIs.

The body below the frontmatter is the canonical workflow content. It must
be tool-agnostic — per-tool frontmatter shape is the adapter's job, not the
template's.

## Per-tool output paths

| Tool | Output |
|---|---|
| Claude Code | `.claude/commands/opsx/<id>.md` (nested folder, no prefix) |
| Cursor | `.cursor/commands/opsx-<id>.md` (flat directory, hyphen prefix) |
| Codex | `${CODEX_HOME:-$HOME/.codex}/prompts/opsx-<id>.md` (global, matches upstream `openspec init` placement) |

Codex output lives **outside the repo** at the user's global Codex prompts
directory. CI cannot verify Codex outputs — contributors must run
`bin/opsx-sync` locally after pulling template changes so their global
Codex prompts stay in sync. See the [CI scope gap](#known-limitations)
section below.

## Recipes

### Edit a workflow

```bash
$EDITOR templates/opsx/apply.md
npm run opsx-sync          # regenerate per-tool files
git status                 # the generated files should appear as modified
git add templates/opsx/apply.md .claude/commands/opsx/apply.md .cursor/commands/opsx-apply.md
git commit
```

### Pull upstream OpenSpec changes safely

```bash
openspec update            # upstream rewrites .claude/commands/opsx/*.md etc.
npm run opsx-sync          # re-applies our patched templates on top
```

Any upstream change you want to absorb is merged into the relevant
`templates/opsx/<id>.md` by hand — the generator does not auto-merge.

### Add a new workflow

1. Propose the addition via OpenSpec — adding a workflow updates the
   "canonical workflow set" requirement in
   `openspec/specs/opsx-template-sync/spec.md`.
2. Once approved, create `templates/opsx/<new-id>.md` with the frontmatter
   contract above.
3. Run `bin/opsx-sync` and commit the new template plus its generated
   Claude/Cursor outputs. Codex output is written to your global prompts
   dir but is not committed (it lives outside the repo).

### Local check before pushing

```bash
npm run opsx-sync -- --check
```

Exits `0` when every per-tool output matches what the generator would
write; `1` otherwise, with a diff printed for each out-of-sync file. CI
runs the same command with `--scope=ci` (skips the Codex global path).

## Known limitations

- **Codex outputs are not CI-checkable.** They live in
  `${CODEX_HOME:-$HOME/.codex}/prompts/`, which is outside the repo. Local
  `bin/opsx-sync --check` always includes Codex; CI uses
  `--scope=ci` to exclude it. Re-run the generator locally after pulling
  template changes.
- **Generated files include the banner — do not strip it.** The CI gate
  expects every generated file to begin with the
  `<!-- generated from templates/opsx/<id>.md — do not edit -->` line.

## Decisions made without consultation

While authoring this README:

1. Used a markdown table for the per-tool output paths rather than prose —
   clearer at a glance.

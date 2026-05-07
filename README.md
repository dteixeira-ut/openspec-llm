# OpenSpec + Claude

This repository explores **spec-driven development with AI** — specifically, whether using [OpenSpec](https://github.com/openspec-ai/openspec) as a structured workflow layer on top of Claude Code produces better software, faster, and with less drift between intent and implementation.

## What This Project Is

Most AI-assisted development today works like this: describe a feature in a chat window, get code back, repeat. There's no durable record of *why* decisions were made, no shared contract between the human and the AI, and every new conversation starts from zero.

OpenSpec is a CLI tool that changes that pattern. It enforces a structured workflow — propose, design, spec, task, apply, archive — where each phase produces a versioned artifact that the next phase reads. By the time Claude is writing code, it has context: the proposal explaining the motivation, the design capturing key decisions, the specs defining testable requirements, and the task list scoping the work.

This project uses OpenSpec + Claude Code as the development workflow for everything it builds — including itself.

## Repository Structure

```
apps/
  presentation/     # React app — walkthrough of the OpenSpec + Claude workflow
openspec/
  changes/          # Active and archived changes (proposals, designs, specs, tasks)
    archive/        # Completed changes
  specs/            # Living spec library — capabilities built so far
  config.yaml       # OpenSpec configuration
```

## Apps

### `apps/presentation`

A static React presentation app that walks through the OpenSpec + Claude workflow. Built for sharing with teams evaluating whether to adopt this approach. Covers spec-driven development concepts, a skill-by-skill walkthrough of how OpenSpec works with Claude Code, an honest pros/cons assessment, and open questions for team discussion.

See [`apps/README.md`](apps/README.md) for details.

## Workflow

Development in this repo uses a CLI plus a set of Claude Code skills covering the full lifecycle, plus CI automation that closes the loop. Skills are grouped into three phases:

### Plan

| Skill | What it does |
|---|---|
| `/opsx:propose` | Describe what to build — Claude creates proposal, design, specs, and tasks |
| `/opsx:explore` | Thinking-partner mode for investigation before committing to a change |
| `/opsx:suggest` | Stress-test an active change — produces a risks/gaps/improvements report and pre-seeds explore |

### Build

| Skill | What it does |
|---|---|
| `/opsx:apply` | Implement the task list with full artifact context loaded |
| `/opsx:refine` | Update specs and code together when implementation reveals a spec gap |
| `/opsx:review` | Audit the diff against specs and tasks before opening a PR |

### Ship & Close

| Skill | What it does |
|---|---|
| `/opsx:pr` | Open the PR using the repo template and post an AI reviewer comment |
| `/opsx:archive` | Sync delta specs into the living library and move the change to `archive/` |
| `/opsx:summarize` | Generate `summary.md` for an archived change — a short, human-readable record |

Each completed change is archived under `openspec/changes/archive/` with a datestamp, preserving the full decision history. A GitHub Action (`.github/workflows/spec-drift-monitor.md`) watches `main` for divergence between code and the living specs in `openspec/specs/` and opens an issue when drift is detected.

### CI automation

Two pieces run without explicit invocation and are responsible for catching things humans skip under pressure:

- **Code Review Gate** — `CLAUDE.md` mandates a `code-review` subagent run after every implementation, before results are presented to the developer. Returns `APPROVED` or `CHANGES REQUESTED`.
- **Spec Drift Monitor** — a [gh-aw](https://github.com/githubnext/gh-aw) workflow at [`.github/workflows/spec-drift-monitor.md`](.github/workflows/spec-drift-monitor.md) runs on merge to `main`. If it detects code that diverges from the living specs in `openspec/specs/`, it opens a GitHub issue assigned to the PR author so nothing slips through unnoticed.

Together, every change is reviewed before merge, drift is surfaced after merge, and the developer never has to remember to run any of it.

## Goal

To answer the question: *does spec-driven development + AI make a team faster and more intentional?* This repo is both the experiment and the evidence.

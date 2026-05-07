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

Development in this repo uses nine Claude Code skills, organized around the propose → implement → review → archive lifecycle:

| Skill | What it does |
|---|---|
| `/opsx:propose` | Describe what to build — Claude creates proposal, design, specs, and tasks |
| `/opsx:explore` | Thinking-partner mode for investigation before committing to a change |
| `/opsx:suggest` | Analyze an active change for risks, gaps, and improvements, then hand off to explore mode |
| `/opsx:apply` | Implement the task list with full artifact context loaded |
| `/opsx:refine` | Adjust delta specs and code mid-flight when implementation reveals a spec gap, ambiguity, or error |
| `/opsx:review` | Run a code review of the current implementation against specs and tasks |
| `/opsx:pr` | Open a pull request with the OpenSpec template and request an AI review |
| `/opsx:archive` | Sync specs to the living library and close the change |
| `/opsx:summarize` | Generate a human-readable summary of a completed or archived change |

Each completed change is archived under `openspec/changes/archive/` with a datestamp, preserving the full decision history. A GitHub Action (`.github/workflows/spec-drift-monitor.md`) watches `main` for divergence between code and the living specs in `openspec/specs/` and opens an issue when drift is detected.

## Goal

To answer the question: *does spec-driven development + AI make a team faster and more intentional?* This repo is both the experiment and the evidence.

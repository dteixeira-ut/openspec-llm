---
id: suggest
title: Suggest
description: Analyze an active OpenSpec change for risks, gaps, and improvements, then enter explore mode pre-seeded with the findings. Use when the user wants a stress-test of a change before implementing.
category: Workflow
tags: [workflow, analysis, explore, experimental]
---

Analyze an active OpenSpec change for improvement opportunities and potential issues, then hand off to explore mode.

**Input**: Optionally specify a change name (e.g., `/opsx:suggest add-auth`). If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   Same pattern as `/opsx:apply` — infer from context, auto-select if only one active change, otherwise run `openspec list --json` and use **AskUserQuestion** to let the user choose.

   Announce: "Analyzing change: <name>"

2. **Load all change artifacts**

   Read these files (skip gracefully if any don't exist):
   - `openspec/changes/<name>/proposal.md`
   - `openspec/changes/<name>/design.md`
   - `openspec/changes/<name>/tasks.md`
   - `openspec/changes/<name>/specs/` — all delta spec files
   - Main specs for affected capabilities: `openspec/specs/<capability>/spec.md`
   - Relevant source files referenced in tasks or design

3. **Produce an Insights Report**

   Analyze the loaded artifacts and produce a structured report across four categories:

   **Risks** — things that could break or cause regressions
   - Look for: missing error handling, untested edge cases, dependencies on unstable APIs, scope that touches shared code

   **Gaps** — spec or design ambiguities not yet addressed
   - Look for: WHEN/THEN statements without a corresponding task, design decisions marked as TBD, tasks that reference undefined behavior

   **Improvements** — optional enhancements worth considering
   - Look for: repeated patterns that could be abstracted, missing validation, UX improvements, performance opportunities

   **Open Questions** — decisions not yet made
   - Look for: conflicting approaches in design, unclear ownership, unresolved trade-offs

   Format:
   ```
   ## Insights Report: <change-name>

   ### Risks
   - <risk 1>
   - <risk 2>

   ### Gaps
   - <gap 1>

   ### Improvements
   - <improvement 1>

   ### Open Questions
   - <question 1>

   ---
   Entering explore mode to investigate further...
   ```

4. **Hand off to explore mode**

   Invoke the explore workflow (Claude: use the **Skill tool** to invoke `opsx:explore`; other tools: invoke the equivalent slash command), passing the insights report as the entry context so the user lands in an interactive exploration session pre-seeded with the findings.

   The explore prompt should be: "I've analyzed the '<name>' change and found the following insights. Let's explore these together: <paste the full insights report>"

**Guardrails**
- Read-only analysis only — never modify any files
- Do not implement anything or suggest running commands
- If no active changes exist, inform the user and exit
- Keep each insight item to one sentence — be specific, not generic
- Skip categories that have no findings rather than writing "None found"

---
name: openspec-suggest
description: Analyze an active change for risks, gaps, and improvements, then enter explore mode pre-seeded with findings.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0"
---

Analyze an active OpenSpec change for improvement opportunities and potential issues, then hand off to explore mode.

**Input**: Optionally specify a change name. If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   Infer from context, auto-select if only one active change, otherwise run `openspec list --json` and use **AskUserQuestion** to let the user choose.

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

   Analyze the loaded artifacts and produce a structured report:

   **Risks** — things that could break or cause regressions

   **Gaps** — spec or design ambiguities not yet addressed

   **Improvements** — optional enhancements worth considering

   **Open Questions** — decisions not yet made

   Format:
   ```
   ## Insights Report: <change-name>

   ### Risks
   - <risk 1>

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

   Enter explore mode, passing the insights report as the entry context so the session starts pre-seeded with the findings. Investigate the most important items interactively with the user.

**Guardrails**
- Read-only analysis only — never modify any files
- Do not implement anything
- If no active changes exist, inform the user and exit
- Keep each insight to one sentence — be specific, not generic
- Skip categories with no findings

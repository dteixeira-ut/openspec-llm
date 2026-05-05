---
name: /opsx-summarize
id: opsx-summarize
category: Workflow
description: Generate a concise human-readable summary of a completed or archived OpenSpec change
---

Generate a concise, human-readable summary of an OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/opsx-summarize add-auth`). If omitted, finds the most recently archived change automatically.

**Steps**

1. **Locate the change**

   If a name is provided, search in this order:
   - Active changes: `openspec/changes/<name>/`
   - Archived changes: `openspec/changes/archive/*/<name>/` (ticket-scoped subfolders)

   If no name is provided, find the most recently archived change:
   ```bash
   ls -td openspec/changes/archive/*/ 2>/dev/null | head -5
   ```
   Use the most recently modified change directory found.

   Announce: "Summarizing change: <name> (from <path>)"

2. **Read change artifacts**

   Read these files (skip gracefully if any don't exist):
   - `proposal.md` — motivation, goals, non-goals
   - `design.md` — approach, key decisions, trade-offs
   - `tasks.md` — implementation checklist
   - `specs/` — delta spec files

3. **Produce the Change Summary**

   ```
   ## Change Summary: <change-name>

   ### What Was Built
   <2-3 sentences. Plain language.>

   ### Why
   <1-2 sentences on the motivation from the proposal.>

   ### Key Decisions
   - <decision 1 — what was chosen and the key trade-off>
   - <decision 2>
   - <decision 3>
   (3-5 decisions maximum)

   ### Spec Changes
   - **<capability-name>**: <added / modified / removed>
   (skip if no delta specs)

   ### Tasks Completed
   **<N>/<M> tasks complete**
   - <task group 1>
   - <task group 2>
   ```

4. **Write `summary.md` and print to terminal**

   Write the summary to two locations:

   **a) Change archive folder:**
   ```
   <change-path>/summary.md
   ```

   **b) Each affected main spec folder** — for every capability with a delta spec:
   ```
   openspec/specs/<capability>/summary.md
   ```

   Overwrite any existing `summary.md` without prompting.

   Announce each location written, then print the summary to the terminal.

**Guardrails**
- If no change is found, report clearly and exit
- Keep the summary scannable: short sentences, no padding
- Do not reproduce full artifact content — synthesize and compress
- If an artifact is missing, skip its section rather than erroring

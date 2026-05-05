---
name: "OPSX: Summarize"
description: Generate a concise human-readable summary of a completed or archived OpenSpec change
category: Workflow
tags: [workflow, summary, documentation]
---

Generate a concise, human-readable summary of an OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/opsx:summarize add-auth`). If omitted, finds the most recently archived change automatically.

**Steps**

1. **Locate the change**

   If a name is provided, search in this order:
   - Active changes: `openspec/changes/<name>/`
   - Archived changes: `openspec/changes/archive/*/<name>/` (ticket-scoped subfolders)

   If no name is provided, find the most recently archived change:
   ```bash
   ls -td openspec/changes/archive/*/ 2>/dev/null | head -5
   ```
   Then within each ticket folder, find the most recently modified change directory. Use the most recent one found.

   Announce: "Summarizing change: <name> (from <path>)"

2. **Read change artifacts**

   Read these files (skip gracefully if any don't exist):
   - `proposal.md` — motivation, goals, non-goals
   - `design.md` — approach, key decisions, trade-offs
   - `tasks.md` — implementation checklist
   - `specs/` — delta spec files (capabilities added or modified)

3. **Produce the Change Summary**

   Output a structured summary using this format:

   ```
   ## Change Summary: <change-name>

   ### What Was Built
   <2-3 sentences describing what was implemented. Plain language, no jargon.>

   ### Why
   <1-2 sentences on the motivation or business goal from the proposal.>

   ### Key Decisions
   - <decision 1 — what was chosen and the key trade-off>
   - <decision 2>
   - <decision 3>
   (3-5 decisions maximum, sourced from design.md)

   ### Spec Changes
   - **<capability-name>**: <what changed — added / modified / removed>
   (list only capabilities with delta specs; skip if no delta specs exist)

   ### Tasks Completed
   **<N>/<M> tasks complete**
   - <task group or category 1>
   - <task group or category 2>
   (group by section if tasks.md has sections; list individual tasks if fewer than 8 total)
   ```

4. **Write `summary.md` and print to terminal**

   Write the summary to two locations:

   **a) Change archive folder** — alongside the other change artifacts:
   ```
   <change-path>/summary.md
   ```

   **b) Each affected main spec folder** — for every capability that has a delta spec in the change (`openspec/changes/<name>/specs/<capability>/`), write the same summary to:
   ```
   openspec/specs/<capability>/summary.md
   ```
   This makes the summary discoverable from the living spec library, not just the archive.

   Overwrite any existing `summary.md` at either location without prompting — it is always regenerated from current artifact state.

   After writing, announce each location:
   ```
   Summary written to:
   - <change-path>/summary.md
   - openspec/specs/<capability-1>/summary.md
   - openspec/specs/<capability-2>/summary.md
   ```

   Then print the summary to the terminal.

**Guardrails**
- If no change is found, report clearly and exit
- Keep the summary scannable: short sentences, no padding
- Do not reproduce full artifact content — synthesize and compress
- If an artifact is missing, skip its section rather than erroring

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
   - `plan.md` — execution plan (when present)
   - `specs/` — delta spec files (capabilities added or modified)

3. **Collect silent-decision markers**

   From each artifact above, extract the `## Decisions made without
   consultation` section (if present). Also collect from any PR bodies opened
   for this change. Discover PR URLs by:

   ```bash
   gh pr list --search "<change-name>" --state all --json url,body,title --limit 10
   ```

   For each candidate PR (title or body references the change name), pull the
   body via `gh pr view <url> --json body --jq .body` and extract its
   `## Decisions made without consultation` section.

   Deduplicate entries by decision text (case-insensitive trim). Preserve
   source attribution — group results by source artifact / PR URL when writing
   them out. If no marker sections were found anywhere, omit the section
   entirely from `summary.md` (no empty placeholder, no "N/A").

4. **Produce the Change Summary**

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

   ### Decisions made without consultation
   <!-- Include this section ONLY when at least one marker entry was collected
        in step 3. Group by source artifact / PR URL. Within each group, list
        each deduplicated decision as a bullet preserving the decision /
        alternative / rationale shape from the source. -->
   **From `proposal.md`**
   - <decision — alternative — rationale>
   **From `design.md`**
   - <decision — alternative — rationale>
   **From PR <url>**
   - <decision — alternative — rationale>
   ```

5. **Write `summary.md` and print to terminal**

   Write the summary to the change folder alongside the other artifacts:
   ```
   <change-path>/summary.md
   ```

   Overwrite any existing `summary.md` without prompting — it is always regenerated from current artifact state.

   After writing, announce the location:
   ```
   Summary written to: <change-path>/summary.md
   ```

   Then print the summary to the terminal.

**Guardrails**
- If no change is found, report clearly and exit
- Keep the summary scannable: short sentences, no padding
- Do not reproduce full artifact content — synthesize and compress
- If an artifact is missing, skip its section rather than erroring

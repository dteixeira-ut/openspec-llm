---
name: "OPSX: Archive"
description: Archive a completed change in the experimental workflow
category: Workflow
tags: [workflow, archive, experimental]
---

Archive a completed change in the experimental workflow.

**Input**: Optionally specify a change name after `/opsx:archive` (e.g., `/opsx:archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Use the **AskUserQuestion tool** to let the user select.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Prompt user for confirmation to continue
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Prompt user for confirmation to continue
   - Proceed if user confirms

   **If no tasks file exists:** Proceed without task-related warning.

4. **Assess delta spec sync state**

   Check for delta specs at `openspec/changes/<name>/specs/`. If none exist, proceed without sync prompt.

   **If delta specs exist:**
   - Compare each delta spec with its corresponding main spec at `openspec/specs/<capability>/spec.md`
   - Determine what changes would be applied (adds, modifications, removals, renames)
   - Show a combined summary before prompting

   **Prompt options:**
   - If changes needed: "Sync now (recommended)", "Archive without syncing"
   - If already synced: "Archive now", "Sync anyway", "Cancel"

   If user chooses sync, use Task tool (subagent_type: "general-purpose", prompt: "Use Skill tool to invoke openspec-sync-specs for change '<name>'. Delta spec analysis: <include the analyzed delta spec summary>"). Proceed to archive regardless of choice.

5. **Perform the archive**

   **Extract the ticket ID from the current git branch:**
   ```bash
   git rev-parse --abbrev-ref HEAD
   ```
   Parse the branch name for a Jira ticket ID matching `RAD-\d+` (e.g., `dteixeira-ut/feature/RAD-123/add-auth` → `RAD-123`).

   - If a ticket ID is found: use it as the parent folder
   - If no ticket ID is found: use **AskUserQuestion** — "No ticket ID found in branch name (`<branch>`). Enter a ticket ID (e.g. RAD-123) or press Enter to use `misc/`." Use `misc` if the user skips.

   **Create the archive directory and move the change:**
   ```bash
   TICKET=<extracted-ticket-or-misc>
   mkdir -p openspec/changes/archive/$TICKET

   # Check if target already exists
   # If openspec/changes/archive/$TICKET/<name>/ exists → show error (see Output On Error)
   # Otherwise:
   mv openspec/changes/<name> openspec/changes/archive/$TICKET/<name>
   ```

   Archive path: `openspec/changes/archive/<TICKET>/<change-name>/`

6. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location (using ticket-scoped path)
   - Spec sync status (synced / sync skipped / no delta specs)
   - Note about any warnings (incomplete artifacts/tasks)

7. **Execute post-archive hooks**

   Read `openspec/config.yaml`. If a `hooks.post-archive` list exists, execute each entry in order.

   For `/opsx:summarize`: use the **Skill tool** to invoke `opsx:summarize`, passing the archived change name. Show the summary output inline below the archive completion summary.

   If config.yaml cannot be read or no hooks are defined, skip silently.

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Ticket:** <TICKET>
**Archived to:** openspec/changes/archive/<TICKET>/<change-name>/
**Specs:** ✓ Synced to main specs

All artifacts complete. All tasks complete.
```

**Output On Success (No Delta Specs)**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Ticket:** <TICKET>
**Archived to:** openspec/changes/archive/<TICKET>/<change-name>/
**Specs:** No delta specs

All artifacts complete. All tasks complete.
```

**Output On Success With Warnings**

```
## Archive Complete (with warnings)

**Change:** <change-name>
**Schema:** <schema-name>
**Ticket:** <TICKET>
**Archived to:** openspec/changes/archive/<TICKET>/<change-name>/
**Specs:** Sync skipped (user chose to skip)

**Warnings:**
- Archived with 2 incomplete artifacts
- Archived with 3 incomplete tasks
- Delta spec sync was skipped (user chose to skip)

Review the archive if this was not intentional.
```

**Output On Error (Archive Exists)**

```
## Archive Failed

**Change:** <change-name>
**Target:** openspec/changes/archive/<TICKET>/<change-name>/

Target archive directory already exists for this ticket.

**Options:**
1. Rename the existing archive to distinguish the two
2. Delete the existing archive if it's a duplicate
3. Archive under a different ticket ID
```

**Guardrails**
- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- If sync is requested, use the Skill tool to invoke `openspec-sync-specs` (agent-driven)
- If delta specs exist, always run the sync assessment and show the combined summary before prompting

---
name: "OPSX: Refine"
description: Refine delta specs and fix code for an active change when implementation reveals a spec gap, ambiguity, or error (Experimental)
category: Workflow
tags: [workflow, artifacts, experimental]
---

Refine the delta specs and fix code for an active OpenSpec change. Use when implementation or verification reveals that the change's specifications were incomplete, ambiguous, or incorrect.

This command operates ONLY on active changes in `openspec/changes/`. It NEVER modifies main specs in `openspec/specs/` or archived changes in `openspec/changes/archive/`. It may update repository code and other non-archived files as needed to implement or refine the active change. It never creates a new change.

**Input**: Optionally specify a change name and issue description (e.g., `/opsx:refine add-auth JWT tokens are not checking expiration`). If omitted, infer or prompt.

**Steps**

1. **Verify an active change exists**

   ```bash
   openspec list --json
   ```

   Parse the JSON output.

   **If no active changes exist:**
   ```
   No active changes found. /opsx:refine works only on active changes.
   To start a new change, use /opsx:propose <name>.
   ```
   Exit. Do not proceed.

   **If active changes exist:** continue to step 2.

2. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, use the **AskUserQuestion tool** to let the user pick from `openspec list --json`

   Announce: `Refining change: <name>` and how to override (e.g., `/opsx:refine <other> <issue>`).

3. **Get the issue description**

   If provided inline, use it. Otherwise use the **AskUserQuestion tool** to ask: *"What issue did you find? Describe the problem you encountered during implementation or verification."* Wait for the response before proceeding.

4. **Check status**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse `schemaName` and artifact states. If the change has no completed artifacts yet (all blocked/ready, none done), exit with: `Change <name> has no completed artifacts yet. Create planning artifacts with /opsx:propose first, then refine once implementation begins.` Refine operates on changes that have at least been partially planned.

5. **Read context files**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   Read every file listed under `contextFiles`. Also read the main specs in `openspec/specs/` for any capability the change's delta specs touch — this is needed to classify the issue in step 7. Use `contextFiles` from CLI output; don't assume specific file names.

6. **Scope check**

   Compare the issue against the change's proposal scope. In scope: bug in code this change introduced/modified; spec gap or ambiguity in a requirement this change added/modified; existing spec for the same capability is ambiguous and blocks this change. Out of scope: entirely new behavior not mentioned in the proposal, or an issue in a different capability.

   If out of scope, use the **AskUserQuestion tool** with three options: (1) out of scope — user will invoke `/opsx:propose` separately; (2) it IS related — ask the user to explain, then proceed; (3) abort. On options 1 and 3, exit gracefully. **Do NOT invoke `/opsx:propose` on the user's behalf.**

7. **Classify the issue and pick the action**

   Look up the issue in the matrix below. The cell tells you what to do in steps 8 and 9.

   | What's wrong                                    | Requirement exists in **main specs** | Requirement was **ADDED in this change** |
   | ----------------------------------------------- | ------------------------------------ | ---------------------------------------- |
   | Spec gap (missing requirement)                  | ADDED to delta spec                  | Add an ADDED block                       |
   | Spec ambiguity (requirement exists but unclear) | MODIFIED in delta spec               | Edit the ADDED block directly            |
   | Spec error (requirement is wrong)               | MODIFIED in delta spec               | Edit the ADDED block directly            |
   | Requirement shouldn't exist                     | REMOVED in delta spec                | Delete the ADDED block                   |
   | Code bug (spec is fine)                         | Validate and fix the code            | Validate and fix the code                |

   Announce:
   ```
   ## Refining: <change-name> (schema: <schema-name>)

   **Issue**: <brief description>
   **Classification**: <row label>
   **Action**: <cell value>
   **Affected spec**: <capability>/spec.md (or "code only")
   ```

   If classification is uncertain, use the **AskUserQuestion tool** to let the user decide.

8. **Update the delta spec (if required)**

   Apply the action from the matrix cell to `openspec/changes/<name>/specs/<capability>/spec.md`. When writing spec updates: describe behavior (not implementation); include at least one `#### Scenario:` block with `**WHEN**` / `**THEN**` bullets (matching the style of existing specs — a `**GIVEN**` bullet may be added when preconditions matter, but is optional) for new or modified requirements; add a single-line refinement comment such as `<!-- Refined: original spec did not specify X; clarified after implementation revealed Y. -->`; follow the project's taxonomy and naming conventions from the config context.

9. **Fix the code**

   Make minimal, focused code changes to resolve the issue. For a code-bug classification, first validate the spec really does describe the intended behavior (re-read it, confirm the bug reproduces against that intent) before patching — this prevents mis-classifying a spec gap as a code bug. Ensure the fix aligns with the updated spec (if the spec was changed). Run relevant tests if available.

10. **Report what was done** — see output templates below.

**Output (spec update applied)**

```
## Refinement Applied

**Change:** <change-name>
**Schema:** <schema-name>
**Issue:** <brief description>
**Classification:** <row label>

### Spec Updated
- **File:** openspec/changes/<name>/specs/<capability>/spec.md
- **Action:** <ADDED | MODIFIED | REMOVED | edited ADDED block | deleted ADDED block>
- **Scenario:** <brief>

### Code Fixed
- <file>: <brief description>

Resume /opsx:apply (or /opsx:archive if everything is complete).
```

**Output (code-only fix)**

```
## Refinement Applied

**Change:** <change-name>
**Schema:** <schema-name>
**Issue:** <brief description>
**Classification:** Code bug (spec is fine)

### Code Fixed
- <file>: <brief description>

Spec validated — no spec update needed. Resume /opsx:apply (or /opsx:archive if everything is complete).
```

**Output (out of scope)**

```
## Out of Scope

**Change:** <change-name>
**Issue:** <brief description>

This issue is outside the scope of the current change. To track it separately, use /opsx:propose <suggested-name>.
```

**Guardrails**

- Operate ONLY on active changes — NEVER modify files in `openspec/specs/`, NEVER modify files in `openspec/changes/archive/`, and NEVER create a new change. If the issue is out of scope, exit and let the user invoke `/opsx:propose`.
- NEVER create new tasks in `tasks.md` for the refinement — the fix happens now.
- If a requirement was ADDED in this change, edit the ADDED block in place — do not create a duplicate MODIFIED block.
- Keep code changes minimal — fix the issue, nothing more.
- If classification or affected capability is uncertain, use the **AskUserQuestion tool** — don't guess.
- If the change has accumulated several refinements, mention it and suggest the user consider whether the original proposal's scope needs revisiting.
- Pause on errors, blockers, or unclear requirements.

**Fluid Workflow Integration**

- **Requires an active change**: will not proceed without one.
- **Can be invoked anytime**: during apply, while reviewing code — no need to finish other steps first.
- **Works with any schema**: uses `contextFiles` from CLI output and adapts.
- **Composable**: after refining, continue with `/opsx:apply` or `/opsx:archive` as appropriate.

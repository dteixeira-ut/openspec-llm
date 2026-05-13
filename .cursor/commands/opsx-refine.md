---
name: opsx-refine
description: "Refine delta specs and fix code for an active OpenSpec change when implementation reveals a spec gap, ambiguity, or error. Use when the user is mid-implementation and discovers that the change's specs were incomplete, ambiguous, or wrong and need to be tightened alongside a code fix."
tags: [workflow, artifacts, experimental]
---

<!-- generated from templates/opsx/refine.md — do not edit -->

Refine the delta specs and fix code for an active OpenSpec change. Use when implementation or verification reveals that the change's specifications were incomplete, ambiguous, or incorrect.

Operates ONLY on active changes in `openspec/changes/`. NEVER modifies `openspec/specs/` or `openspec/changes/archive/`. May update repository code as needed to implement or refine the active change.

**Input** (optional): change name and issue description, e.g. `/opsx:refine add-auth JWT tokens are not checking expiration`. If omitted, infer or prompt.

**Steps**

1. **Verify an active change exists**

   ```bash
   openspec list --changes --json
   ```

   Parse the JSON output.

   **If no active changes exist:**
   ```
   No active changes found. /opsx:refine works only on active changes.
   To start a new change, use /opsx:propose <name>.
   ```
   Exit.

   **If active changes exist:** continue to step 2.

2. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context
   - Auto-select if only one active change exists
   - If ambiguous, use the **AskUserQuestion tool** to let the user pick from `openspec list --changes --json`

   Announce: `Refining change: <name>`; mention override syntax `/opsx:refine <other> <issue>`.

3. **Get the issue description**

   If provided inline, use it. Otherwise use the **AskUserQuestion tool** to ask: *"What issue did you find? Describe the problem you encountered during implementation or verification."*

4. **Check status**

   ```bash
   openspec status --change "<name>" --json
   ```

   Parse `schemaName` and artifact states. If the change has no completed artifacts yet (all blocked/ready, none done), exit with: `Change <name> has no completed artifacts yet. Create planning artifacts with /opsx:propose first, then refine once implementation begins.`

5. **Read context files**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   Read every file listed under `contextFiles`. Also read main specs in `openspec/specs/` for any capability touched by delta specs (needed for step 7 classification). Use `contextFiles` from CLI output; don't assume specific file names.

6. **Scope check**

   Compare the issue against the change's proposal scope. In scope: bug in code this change introduced/modified; spec gap or ambiguity in a requirement this change added/modified; existing spec for the same capability is ambiguous and blocks this change. Out of scope: entirely new behavior not mentioned in the proposal, or an issue in a different capability.

   If out of scope, use the **AskUserQuestion tool** with four options: (1) **out of scope** — exit and emit the out-of-scope output template; (2) **partial scope** — route the in-scope portion through steps 7–9, defer the rest to the partial-scope output template; (3) **it IS related** — ask the user to explain, then proceed; (4) **abort** — exit gracefully. **Do NOT invoke `/opsx:propose` on the user's behalf.**

7. **Classify the issue and pick the action**

   Look up the issue in the matrix below. The cell tells you what to do in steps 8 and 9. (For partial scope from step 6, classify the in-scope portion only.)

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

   Apply the matrix action to `openspec/changes/<name>/specs/<capability>/spec.md`:
   - Describe behavior, not implementation.
   - For new or modified requirements, include at least one `#### Scenario:` block with `**WHEN**` / `**THEN**` bullets (`**GIVEN**` optional, for preconditions).
   - Add a single-line refinement comment, e.g. `<!-- Refined: original spec did not specify X; clarified after implementation revealed Y. -->`.
   - Follow taxonomy and naming conventions from the config context.

9. **Fix the code**

   Make minimal, focused code changes. For code-bug classification, re-read the spec and confirm the bug reproduces against intended behavior before patching (prevents mis-classifying a spec gap as a code bug). Align with the updated spec if changed. Run relevant tests and validations.

10. **Report what was done** — emit the output below, including only sections relevant to the path.

**Output**

Per-path assembly (use the section library below; omit anything not listed):

- **Spec update applied** → header `## Refinement Applied`. Sections: meta + Spec Updated + Code Fixed + Resume.
- **Code-only fix** → header `## Refinement Applied`. Sections: meta (Classification = `Code bug (spec is fine)`) + Code Fixed + `Spec validated — no spec update needed.` + Resume.
- **Partial scope** → header `## Refinement Applied (Partial Scope)`. Sections: meta (suffix Classification with ` (in-scope portion)`) + Spec Updated + Code Fixed + Follow-up Proposal + Resume.
- **Out of scope** → header `## Out of Scope`. Sections: meta (omit Schema and Classification) + Follow-up Proposal. No Resume.

Section library:

```
<header>

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

### Follow-up Proposal
Track separately:
/opsx:propose <suggested-name> <one-line summary derived from issue + step 5 context>

Resume /opsx:apply (or /opsx:archive if everything is complete).
```

**Ambiguity escalation contract (refine-time)**

Spec edits during refine are themselves frequently must-ask: they change the
contract downstream agents are coded against. Apply the two-class contract
from `openspec/config.yaml` `ambiguity:` and the `opsx-workflow` living spec:

- **Must-ask classes** — escalate before editing. At refine-time the
  hot-spot classes are: conflict between spec scenario wording and legacy
  code on a brownfield change, library-vs-spec surface mismatches, and any
  choice between two equally-plausible WHEN/THEN interpretations.
- **May-decide classes** — proceed and record the call in a
  `## Decisions made without consultation` section appended to the delta
  spec file you modified (or `tasks.md` if you adjust tasks during refine).

The marker section is omitted entirely when no may-decide calls were made.

**Guardrails**

- Operate ONLY on active changes — NEVER modify `openspec/specs/` or `openspec/changes/archive/`, and NEVER create a new change. If the issue is out of scope, exit and let the user invoke `/opsx:propose`.
- Apply the ambiguity contract above when editing delta specs or code.
- NEVER create new tasks in `tasks.md` for the refinement — the fix happens now.
- If a requirement was ADDED in this change, edit the ADDED block in place — do not create a duplicate MODIFIED block.
- Keep code changes minimal — fix the issue, nothing more.
- If classification or affected capability is uncertain, use the **AskUserQuestion tool** — don't guess.
- If the change has accumulated several refinements, suggest the user revisit the original proposal's scope.
- Pause on errors, blockers, or unclear requirements.

**Fluid Workflow Integration**

- **Requires an active change.**
- **Can be invoked anytime** — during apply, or while reviewing code.
- **Works with any schema**: uses `contextFiles` from CLI output and adapts.
- **Composable**: after refining, continue with `/opsx:apply` or `/opsx:archive` as appropriate.

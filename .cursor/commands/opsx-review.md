---
name: /opsx-review
id: opsx-review
category: Workflow
description: Run a code review of the current implementation against specs and tasks
---

Run a code review of the current implementation.

**Input**: Optionally provide a brief description of what was implemented. If omitted, the review is based entirely on the git diff and any context files found in the repo.

**Steps**

1. **Get the diff**

   ```bash
   git diff HEAD
   ```

   If nothing is uncommitted, check the most recent commit:
   ```bash
   git diff HEAD~1 HEAD
   ```

   Also run `git status`. If there are no changes at all, return APPROVED with a note that nothing was changed.

2. **Load context**

   Search for files that describe what was intended:
   - Task files: `tasks.md`, or recently changed `.md` files containing `- [ ]` / `- [x]` checkboxes
   - Plan/design files: `design.md`, `proposal.md`
   - Specs: `spec.md` files, any `specs/` directories
   - `CLAUDE.md` at repo root for repo conventions

   Read whatever you find. If nothing exists, proceed using only the diff.

3. **Review each changed file**

   For every file in the diff, assess:
   - **Task coverage**: Does every completed task (`[x]`) have a corresponding code change?
   - **Scope discipline**: Are changes limited to what was described?
   - **Design alignment**: Does the implementation match the stated approach?
   - **Code quality**: Obvious bugs, security issues, broken error handling, anti-patterns
   - **Completeness**: No half-finished implementations or TODO stubs in critical paths

4. **Make the decision**

   **APPROVED** when: all completed tasks have visible implementation, code aligns with design/spec, no critical bugs or security issues.

   **CHANGES REQUESTED** when: completed tasks have no code change, implementation diverges from design, critical bugs or security issues found.

5. **Return a structured result**

   ```
   ## Code Review Result

   **Decision:** APPROVED

   ### Summary
   <brief description of what was reviewed>

   ### Notes
   - <optional non-blocking observations>
   ```

   Or if requesting changes:

   ```
   ## Code Review Result

   **Decision:** CHANGES REQUESTED

   ### Summary
   <brief description of what was reviewed>

   ### Issues
   - <specific, actionable issue — include file and line if possible>
   ```

**After the review:**
- If `APPROVED` → suggest `/opsx:archive` as the next step
- If `CHANGES REQUESTED` → show the issues clearly and wait for guidance

**Guardrails**
- Flag real issues only — not style preferences
- Be specific: name the file and the problem
- Do not approve work with unimplemented tasks or critical bugs

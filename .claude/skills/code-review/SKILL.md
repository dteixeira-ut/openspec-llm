---
name: code-review
description: Review implemented code changes from a code reviewer's perspective. Checks task coverage, design alignment, and code quality. Returns APPROVED or CHANGES REQUESTED. Use after completing any implementation work.
license: MIT
compatibility: Works with any git repository.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0"
---

Review implemented code changes and decide whether they are ready to present to the developer.

**Input**: A change summary describing what was implemented and why. If invoked as a subagent, this is provided in the prompt. Also inspect the repo directly.

**Steps**

1. **Get the diff**

   ```bash
   git diff HEAD
   ```

   If nothing is uncommitted, check the most recent commit:
   ```bash
   git diff HEAD~1 HEAD
   ```

   Also run:
   ```bash
   git status
   ```

   If there are no changes at all, return APPROVED with a note that nothing was changed.

2. **Load context**

   Search for files that describe what was intended:

   - Task files: `tasks.md`, `TODO.md`, or recently changed `.md` files containing `- [ ]` / `- [x]` checkboxes
   - Plan/design files: `design.md`, `proposal.md`, `PLAN.md`, any `.md` in `.claude/plans/`
   - Specs: `spec.md` files, any `specs/` directories
   - CLAUDE.md at repo root for repo conventions

   Read whatever you find. If nothing exists, proceed using only the diff and the change summary provided.

3. **Review each changed file**

   For every file in the diff, assess:

   - **Task coverage**: Does every completed task (`[x]`) have a corresponding code change? Is anything promised but missing?
   - **Scope discipline**: Are changes limited to what was described? Flag unrelated modifications.
   - **Design alignment**: Does the implementation match the stated approach (if a design doc exists)?
   - **Code quality**:
     - Obvious bugs (null dereferences, off-by-one errors, unreachable branches)
     - Security issues: injection (SQL, command, XSS), hardcoded secrets, missing auth checks, unsafe deserialization, unvalidated external input
     - Broken or swallowed error handling
     - Anti-patterns that will cause maintainability problems
   - **Completeness**: No half-finished implementations, no TODO stubs left in critical paths, no placeholder logic in production code paths

4. **Silent-decisions marker check**

   For every agent-authored artifact in the diff (`proposal.md`, `design.md`,
   `specs/<capability>/spec.md`, `tasks.md`, `plan.md`, PR bodies, `summary.md`),
   scan the diff for evidence of decisions made without explicit user
   consultation:

   - Filename, identifier, or section-header choices not named by the user
   - Default values introduced (e.g. defaulting an intermediate-PR build gate
     to `lint-only`)
   - Library, framework, or pattern choice that diverged from — or that was
     ambiguous in — the planning artifacts
   - Trade-offs accepted on ambiguous tasks

   If candidates exist AND the artifact has no `## Decisions made without
   consultation` section, surface a finding `Marker missing — likely silent
   decisions detected` in the Notes (or Issues if the missing marker would mask
   a must-ask-class decision per `openspec/config.yaml` `ambiguity.must-ask`).

5. **Make the decision**

   **APPROVED** when:
   - All completed tasks have visible implementation
   - Code aligns with any available design/spec context
   - No critical bugs, security issues, or missing critical paths found

   **CHANGES REQUESTED** when:
   - One or more completed tasks have no corresponding code change
   - Implementation diverges from design/specs without explanation
   - Critical bugs, security vulnerabilities, or broken error handling found
   - Significant scope creep that could introduce regressions

6. **Return a structured result**

   End your response with this exact block (the calling agent parses `**Decision:**`):

   ```
   ## Code Review Result

   **Decision:** APPROVED

   ### Summary
   <brief description of what was reviewed: files changed, scope, what tasks were covered>

   ### Notes
   - <optional non-blocking observations — style, minor improvements, things worth knowing>
   ```

   Or if requesting changes:

   ```
   ## Code Review Result

   **Decision:** CHANGES REQUESTED

   ### Summary
   <brief description of what was reviewed>

   ### Issues
   - <specific, actionable issue — include file and line if possible>
   - <another issue>

   ### Notes
   - <optional non-blocking observations>
   ```

**Guardrails**
- Flag real issues, not style preferences — only block on correctness, security, and completeness
- Be specific: vague feedback like "improve error handling" is not actionable; name the file and the problem
- Do not suggest changes outside the scope of what was implemented
- Do not approve work that has unimplemented tasks or critical bugs — be a genuine gatekeeper
- If context files are missing, review the diff on its own merits; don't fail because docs don't exist

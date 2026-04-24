# CLAUDE.md

This repo uses the OpenSpec workflow for spec-driven development. See `openspec/` for changes, specs, and config.

## Code Review Gate

After completing any implementation work — when all tasks are done, a plan has been fully implemented, or specs have been fulfilled — you MUST run a code review before presenting results to the developer.

**How to run the review:**

Use the Task tool to spawn a review subagent:
- `subagent_type: "general-purpose"`
- `prompt: "Use Skill tool to invoke code-review. Change summary: <one paragraph describing what was implemented and why>. Review the git diff and any relevant spec/task/design context you can find."`

**After the review:**
- If the subagent returns `**Decision:** APPROVED` → present the completion results normally
- If the subagent returns `**Decision:** CHANGES REQUESTED` → show the review feedback instead of a success message; pause for developer guidance

Do not skip this step. The review gate applies to all implementation work regardless of workflow or tooling used.

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

## Workflow-tool invocation: prefer the skill, not the CLI

Workflow operations with declared side effects MUST be invoked via the corresponding `/opsx:*` skill, not the underlying `openspec` CLI. A workflow operation has declared side effects when its skill body documents hooks (`openspec/config.yaml hooks.*`), sequenced invocation of another `/opsx:*` skill, or additional artifact writes beyond what the CLI produces.

Today the load-bearing instance is `openspec archive` (CLI) ↔ `/opsx:archive` (skill). The skill executes `hooks.post-archive` and invokes `/opsx:summarize` to write `summary.md`; the CLI does neither. Calling the CLI directly silently drops the hook.

If the Skill tool is unreachable in the current environment, treat the situation as a must-ask escalation per the ambiguity contract and log the CLI use plus the missed side effects in a `## Decisions made without consultation` section of the relevant artifact.

Full text and scenarios: `openspec/specs/opsx-workflow/spec.md` (Requirement: Workflow operations with declared side effects).

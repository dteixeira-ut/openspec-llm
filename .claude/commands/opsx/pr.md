---
name: "OPSX: PR"
description: Create a pull request with the OpenSpec template, post @cursor review, and poll for AI reviewer response
category: Workflow
tags: [workflow, pr, github, review, experimental]
---

Create a pull request for a completed OpenSpec change, post an AI reviewer comment, and poll for a response.

**Input**: Optionally specify a change name (e.g., `/opsx:pr add-auth`). If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   Infer from context or run `openspec list --json` and use **AskUserQuestion** to let the user select.
   Announce: "Creating PR for change: <name>"

2. **Check pre-conditions**

   - Confirm a review has been run by looking for recent `APPROVED` output in the conversation.
   - If no review is found: warn the user — "No review result found. Run `/opsx:review` first." — then **AskUserQuestion**: "Proceed without review?" If no, stop. If yes, continue with a warning note.

3. **Read change context**

   Locate the archived change to populate the PR body:
   ```bash
   git rev-parse --abbrev-ref HEAD
   ```
   Extract ticket ID (e.g., `RAD-123`) from the branch name using pattern `RAD-\d+`.

   Archived path: `openspec/changes/archive/<TICKET>/<change-name>/`

   Read:
   - `proposal.md` → extract the core goal for the **Purpose** section
   - `design.md` → extract a 2-3 sentence implementation direction for the **Implementation** section

4. **Enforce branch naming via git-workflow**

   Use the **Skill tool** to invoke `git-workflow`. The skill will verify the current branch matches the required naming convention. If the branch is non-compliant, stop and show the required format.

5. **Generate PR title**

   Derive a Conventional Commits-style title from the proposal goal:
   - Format: `feat(<scope>): <short summary>` — max 70 characters, imperative mood
   - Scope: use the change name or a short capability name

6. **Create the PR**

   ```bash
   gh pr create \
     --title "<conventional-commit title>" \
     --body "$(cat <<'PREOF'
   # Purpose
   <2-3 sentences from proposal.md — business goal in plain language>

   # Implementation
   <2-3 sentences from design.md — what approach was taken and key decisions>
   Link to full design: openspec/changes/archive/<TICKET>/<change-name>/design.md

   # OpenSpec Change
   `<change-name>` — artifacts at openspec/changes/archive/<TICKET>/<change-name>/

   # Demo
   _Add screenshots or recordings if applicable._
   PREOF
   )"
   ```

   Capture the returned PR URL.

7. **Output PR URL immediately**

   Print: "PR created: <URL>"
   Do this before starting the polling loop so the user can navigate there directly.

8. **Post AI reviewer comment**

   Read `agents.pr-reviewers` from `openspec/config.yaml`.
   Build a mention string from the list (e.g., `cursor` → `@cursor`, multiple → `@cursor @codex`).

   ```bash
   gh pr comment <PR-URL> --body "@cursor review"
   ```

   Print: "Posted reviewer comment: <mention string>"

9. **Start polling loop**

   Use the **ScheduleWakeup tool** with `delaySeconds: 120` to schedule the first poll check.

   Pass this prompt (fill in the actual values before scheduling):
   ```
   Poll check 1/5 for PR <URL> — check if any of these reviewers have commented: <reviewer-list>.
   Run: gh pr view <URL> --json comments --jq '[.comments[] | {author: .author.login, body: .body, createdAt: .createdAt}]'
   Compare the comment list against the baseline count of <N> comments at PR creation time (recorded below).
   Baseline comment count: <N>
   Reviewer list: <from config>
   PR URL: <URL>

   If any new comment is from a configured reviewer → notify the user with the comment preview and stop polling.
   If no reviewer comment found and this is iteration < 5 → use ScheduleWakeup (delaySeconds: 120) with the same prompt but increment the iteration number.
   If iteration = 5 with no response → alert: "No AI reviewer response after 10 minutes. Check the PR manually: <URL>"
   ```

   Record the baseline comment count immediately after posting the reviewer comment:
   ```bash
   gh pr view <PR-URL> --json comments --jq '.comments | length'
   ```

**Output On PR Creation**

```
## PR Created

**Change:** <change-name>
**Branch:** <branch-name>
**PR:** <URL>

Reviewer comment posted: @cursor review
Polling for reviewer response every 2 minutes (max 10 min)...
```

**Output On Reviewer Response Detected (during poll)**

```
## AI Reviewer Responded

**Reviewer:** @cursor
**PR:** <URL>

> <first 200 chars of comment>

Check the full review at: <URL>
```

**Output On Timeout (poll iteration 5, no response)**

```
## No AI Reviewer Response

No response from configured reviewers after 10 minutes.
Check the PR manually: <URL>

Configured reviewers: <list from config>
```

**Guardrails**
- Always output the PR URL immediately after creation, before polling starts
- Do not create a PR if the branch is non-compliant per `git-workflow`
- Warn but do not block if no prior review result is found — let the user decide
- If `agents.pr-reviewers` is empty or missing from config, skip the reviewer comment and warn
- Record baseline comment count before starting polls to avoid false positives
- Polling is best-effort — always give the user the PR URL so they can monitor directly

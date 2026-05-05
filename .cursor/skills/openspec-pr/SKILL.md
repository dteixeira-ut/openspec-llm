---
name: openspec-pr
description: Create a pull request with the OpenSpec template, post an AI reviewer comment, and poll for response. Use after implementation is reviewed and approved.
license: MIT
compatibility: Requires openspec CLI and gh CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0"
---

Create a pull request for a completed OpenSpec change, post an AI reviewer comment, and poll for a response.

**Input**: Optionally specify a change name. If omitted, infer from context or prompt.

**Steps**

1. **Select the change**

   Infer from context or run `openspec list --json` and use **AskUserQuestion** to let the user select.
   Announce: "Creating PR for change: <name>"

2. **Check pre-conditions**

   Confirm a review has been run by looking for recent `APPROVED` output in the conversation. If not found, warn the user and use **AskUserQuestion**: "Proceed without review?" Stop if no.

3. **Read change context**

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```
   Extract ticket ID (pattern `RAD-\d+`) from the branch name.
   Archived path: `openspec/changes/archive/<TICKET>/<change-name>/`

   Read `proposal.md` for **Purpose** and `design.md` for **Implementation**.

4. **Enforce branch naming**

   Verify the current branch matches:
   `[gh-user]/[feature|fix|tmp|spike]/[jira-id]/[short-description]`

   If non-compliant, stop and show the required format.

5. **Generate PR title**

   Conventional Commits style: `feat(<scope>): <short summary>` — max 70 characters.

6. **Create the PR**

   ```bash
   gh pr create \
     --title "<conventional-commit title>" \
     --body "$(cat <<'PREOF'
   # Purpose
   <2-3 sentences from proposal.md>

   # Implementation
   <2-3 sentences from design.md>
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

8. **Post AI reviewer comment**

   Read `agents.pr-reviewers` from `openspec/config.yaml` (defaults to `[cursor]`).

   ```bash
   gh pr comment <PR-URL> --body "@cursor review"
   ```

9. **Start polling loop**

   Record baseline comment count:
   ```bash
   gh pr view <PR-URL> --json comments --jq '.comments | length'
   ```

   Poll every 2 minutes, up to 5 times (10 min max):
   - Check for new comments from any configured reviewer
   - If a reviewer responds → notify user with comment preview, stop polling
   - If 5th check with no response → alert: "No AI reviewer response after 10 minutes. Check the PR manually: <URL>"

**Guardrails**
- Always output PR URL before polling starts
- Do not create a PR if branch naming is non-compliant
- Warn but do not block if no prior review result is found
- If `agents.pr-reviewers` is empty or missing, skip reviewer comment and warn

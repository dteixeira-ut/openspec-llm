---
id: pr
title: PR
description: Create a pull request with the OpenSpec template, post an AI reviewer comment (e.g. @cursor), and poll for AI reviewer response. Use when the user wants to open a PR for a completed change after running /opsx:review.
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

4. **Enforce branch naming via git-workflow (with stacked-mid-implementation mode)**

   Before invoking `git-workflow`, check whether this PR is a stacked sub-PR
   on top of an in-flight change:

   ```bash
   current_branch=$(git rev-parse --abbrev-ref HEAD)
   active_change=$(openspec list --changes --json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['name'] if d else '')")
   ```

   If `active_change` is non-empty AND the capabilities directory exists,
   inspect it:

   ```bash
   ls openspec/changes/${active_change}/specs/ 2>/dev/null
   ```

   When `current_branch` exactly equals one of the capability names returned
   above, enter **stacked-mid-implementation mode**:

   - SKIP the `git-workflow` branch-name enforcement (the capability name is
     the canonical branch identifier for the stacked PR).
   - The PR body MUST include a "Stacked on top of #<prior>; merge in order"
     line at the top of the `# Purpose` section. If the prior PR number is not
     known, ask the user via **AskUserQuestion** before continuing.

   Otherwise (no active change, or branch does not match a capability name),
   use the **Skill tool** to invoke `git-workflow` as before. If the branch is
   non-compliant, stop and show the required format.

5. **Generate PR title**

   Derive a Conventional Commits-style title from the proposal goal:
   - Format: `feat(<scope>): <short summary>` — max 70 characters, imperative mood
   - Scope: use the change name or a short capability name

6. **Collect silent decisions for the PR body**

   Before composing the body, harvest any `## Decisions made without
   consultation` sections from artifacts touched during this implementation
   pass:

   - The change's `proposal.md`, `design.md`, `tasks.md`, `plan.md` (if
     present), and each `specs/<capability>/spec.md`.
   - Any may-decide calls logged in the conversation that did not have an
     authoring artifact home (apply touched only code).

   Deduplicate by decision text. If at least one entry exists, the
   `# Decisions made without consultation` block below MUST appear in the PR
   body. If none exist, OMIT the block entirely (no empty placeholder).

7. **Create the PR**

   ```bash
   gh pr create \
     --title "<conventional-commit title>" \
     --body "$(cat <<'PREOF'
   # Purpose
   <If stacked-mid-implementation mode: "Stacked on top of #<prior>; merge in order" on the first line>
   <2-3 sentences from proposal.md — business goal in plain language>

   # Implementation
   <2-3 sentences from design.md — what approach was taken and key decisions>
   Link to full design: openspec/changes/archive/<TICKET>/<change-name>/design.md

   # OpenSpec Change
   `<change-name>` — artifacts at openspec/changes/archive/<TICKET>/<change-name>/

   # Decisions made without consultation
   <!-- Include this section ONLY when step 6 collected at least one entry.
        Each bullet names the decision, the alternative rejected, and the
        rationale. Omit the block entirely otherwise. -->
   - <decision — alternative — rationale>

   # Demo
   _Add screenshots or recordings if applicable._
   PREOF
   )"
   ```

   Capture the returned PR URL.

8. **Output PR URL immediately**

   Print: "PR created: <URL>"
   Do this before starting the polling loop so the user can navigate there directly.

9. **Post AI reviewer comment**

   Read `agents.pr-reviewers` from `openspec/config.yaml`.
   Build a mention string from the list (e.g., `cursor` → `@cursor`, multiple → `@cursor @codex`).

   ```bash
   gh pr comment <PR-URL> --body "@cursor review"
   ```

   Print: "Posted reviewer comment: <mention string>"

10. **Start polling loop**

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

**Ambiguity escalation contract (PR-time)**

Apply the two-class contract from `openspec/config.yaml` `ambiguity:`:

- **Must-ask classes** — escalate before opening the PR. The hot-spots here
  are: repo merge-method when choosing a stacked-PR delivery shape (confirm
  it matches the repo setting before opening), and the prior PR number in
  stacked-mid-implementation mode.
- **May-decide classes** — proceed and ensure each call appears under the
  PR body's `# Decisions made without consultation` section. The marker
  section is omitted when no may-decide calls were made during the
  implementation pass.

**Guardrails**
- Always output the PR URL immediately after creation, before polling starts
- Do not create a PR if the branch is non-compliant per `git-workflow`,
  unless stacked-mid-implementation mode applies (see step 4)
- Warn but do not block if no prior review result is found — let the user decide
- If `agents.pr-reviewers` is empty or missing from config, skip the reviewer comment and warn
- Record baseline comment count before starting polls to avoid false positives
- Polling is best-effort — always give the user the PR URL so they can monitor directly
- Apply the ambiguity contract above: stop on must-ask classes; surface
  may-decide calls in the PR body's marker section

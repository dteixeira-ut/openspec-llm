---
name: opsx-plan
description: "Emit a delivery-plan artifact (plan.md) for an active OpenSpec change, capturing PR shape, repo merge-method, named /opsx:* skill invocations per boundary, intermediate-PR build gate, stop conditions, and the rebase recipe when applicable. Use when the user wants to plan execution after /opsx:propose but before /opsx:apply, or when delivery shape changes mid-implementation."
tags: [workflow, plan, delivery-shape, experimental]
---

<!-- generated from templates/opsx/plan.md — do not edit -->

Generate an execution plan (`plan.md`) for an active OpenSpec change.

I'll consume the change's existing artifacts (`proposal.md`, `design.md`,
`specs/`, `tasks.md`), run a merge-method preflight against the repo, and
emit `openspec/changes/<name>/plan.md` with the named `/opsx:*` skill
invocations per boundary, the chosen branch strategy, the intermediate-PR
build gate, stop conditions, and (when applicable) the verbatim rebase recipe.

The plan artifact is OPTIONAL — `/opsx:apply` continues to work without it.
When present, apply reads it and surfaces named stop conditions at each
capability boundary.

---

**Input**: The argument after `/opsx:plan` is the change name (optional).
If omitted, infer from conversation context, auto-select when exactly one
active change exists, or prompt.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context.
   - Auto-select if exactly one active change exists.
   - If ambiguous, run `openspec list --changes --json` and ask the user
     to choose which change to plan.

   Announce: `Planning change: <name>`.

2. **Verify applyRequires artifacts are done**

   ```bash
   openspec status --change "<name>" --json
   ```

   For every artifact ID listed under `applyRequires`, confirm
   `status == "done"`. If any is missing, refuse to write `plan.md` — print
   the missing artifacts and exit.

3. **Read the change's artifacts**

   Read `proposal.md`, `design.md`, every file under `specs/`, and
   `tasks.md`. Extract `Starting state:`, `Cutover:`, the `## Delivery shape`
   section, and the capability list.

4. **Merge-method preflight**

   ```bash
   gh api repos/{owner}/{repo} --jq '{squash: .allow_squash_merge, merge: .allow_merge_commit, rebase: .allow_rebase_merge}'
   ```

   Derive `{owner}/{repo}` from `git remote get-url origin`.

   - If exactly one method is allowed → that is the merge-method.
   - If multiple are allowed → honor `design.md`'s `## Delivery shape` if
     it picks one; otherwise this is a must-ask class.
     <!-- Claude affordance: use AskUserQuestion with options=[squash, merge, rebase] -->
     Ask the user to choose one of: squash, merge, or rebase.
   - If `gh` is unavailable, unauthenticated, or ambiguous:
     <!-- Claude affordance: use AskUserQuestion with options=[squash, merge, rebase] -->
     ask the user to choose one of: squash, merge, or rebase. Do not silently default.

5. **Resolve must-ask classes**

   The plan command treats these as must-ask classes per
   `openspec/config.yaml` `ambiguity:`:
   - Sub-PR strategy: `one big PR` / `per-capability stack` /
     `per-capability parallel`.
   - Intermediate-PR build gate: `lint-only` / `lint+test` /
     `lint+test+build`.
   - Stop conditions.

   If they cannot be derived from the artifacts or repo settings, stop and
   ask the user. For sub-PR strategy:
   <!-- Claude affordance: use AskUserQuestion with options=[one big PR, per-capability stack, per-capability parallel] -->
   ask the user to choose one of: "one big PR", "per-capability stack", or "per-capability parallel". For the intermediate-PR build gate:
   <!-- Claude affordance: use AskUserQuestion with options=[lint-only, lint+test, lint+test+build] -->
   ask the user to choose one of: "lint-only", "lint+test", or "lint+test+build". For stop conditions, ask the user to enumerate them.

6. **Compose `plan.md`**

   Write `openspec/changes/<name>/plan.md` with:

   ```markdown
   # Execution Plan: <change-name>

   ## Branch strategy
   - **PR shape**: <value>
   - **Base branch**: <main or integration branch name>
   - **Integration branch**: <name or N/A>
   - **Repo merge-method**: <squash | merge | rebase>
   - **Intermediate-PR build gate**: <lint-only | lint+test | lint+test+build>

   ## Skill invocations per boundary
   - **Propose-end**: <skills>
   - **Capability-start**: <skills>
   - **Capability-end**: <skills>
   - **Archive**: <skills>

   ## Stop conditions
   - <named pause point 1>
   - <named pause point 2>

   ## Rebase recipe
   <!-- Include verbatim ONLY when PR shape is `per-capability stack` AND
        merge-method is `squash`. Omit otherwise. -->
   When the previous capability's PR is squash-merged into the base branch,
   each remaining stacked branch must be rebased onto the new base SHA:

   ```bash
   git fetch origin
   git checkout <downstream-branch>
   git rebase --onto origin/<base-branch> <prev-branch> <downstream-branch>
   git push --force-with-lease
   ```

   ## Decisions made without consultation
   <!-- Include ONLY when at least one may-decide call was made. -->
   - <decision — alternative — rationale>
   ```

7. **Print the result**

   ```
   ## Plan Written

   **Change:** <change-name>
   **Path:** openspec/changes/<change-name>/plan.md
   **PR shape:** <value>
   **Merge-method:** <value>
   **Rebase recipe included:** <yes | no>
   ```

   Then echo the plan body to the terminal.

**Ambiguity escalation contract (plan-time)**

Must-ask classes per `openspec/config.yaml` `ambiguity:`:
- Repo merge-method when not derivable from `gh api`.
- Sub-PR strategy when `design.md` is silent and inference is not obvious.
- Intermediate-PR build gate.
- Stop conditions.

May-decide calls (e.g. plan section-header wording, default sentence shape)
are logged in the plan's `## Decisions made without consultation` section.
The section is omitted entirely when no may-decide calls were made.

**Guardrails**

- Do NOT add `plan` to `applyRequires`. The artifact stays optional.
- Do NOT author or modify `proposal.md`, `design.md`, `specs/`, or
  `tasks.md` — only consume them.
- Stop on must-ask classes; do not silently default merge-method, sub-PR
  strategy, build gate, or stop conditions.
- The rebase recipe MUST appear verbatim when strategy is `per-capability
  stack` and merge-method is `squash`.

**Output On Missing applyRequires**

```
## Plan Refused

**Change:** <change-name>
**Missing artifacts:** <comma-separated artifact IDs>

Run /opsx:propose <change-name> to complete the planning artifacts first.
```

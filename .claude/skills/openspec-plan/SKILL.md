---
name: openspec-plan
description: Emit a delivery-plan artifact (plan.md) for an active OpenSpec change, capturing PR shape, repo merge-method, named /opsx:* skill invocations per boundary, intermediate-PR build gate, stop conditions, and the rebase recipe when applicable. Use when the user wants to plan execution after /opsx:propose but before /opsx:apply, or when delivery shape changes mid-implementation.
license: MIT
compatibility: Requires openspec CLI and (preferably) gh CLI for the merge-method preflight.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0"
---

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

**Input**: Optionally specify a change name (e.g., `/opsx:plan add-auth`).
If omitted, infer from conversation context or auto-select when exactly one
active change exists; prompt otherwise.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context.
   - Auto-select if exactly one active change exists.
   - If ambiguous, run `openspec list --changes --json` and use the
     **AskUserQuestion tool** to let the user select.

   Announce: `Planning change: <name>` and the override syntax
   `/opsx:plan <other>`.

2. **Verify applyRequires artifacts are done**

   ```bash
   openspec status --change "<name>" --json
   ```

   For every artifact ID listed under `applyRequires`, confirm
   `status == "done"`. If any is missing, refuse to write `plan.md` — print
   the missing artifacts and exit. The plan command does not author
   planning artifacts; it only consumes them.

3. **Read the change's artifacts**

   Read `proposal.md`, `design.md`, every file under `specs/`, and
   `tasks.md`. Look specifically for:
   - `Starting state:` (brownfield / greenfield) from proposal.
   - `Cutover:` from proposal.
   - `## Delivery shape` from design (PR shape, base branch, repo
     merge-method assumption, skill invocations).
   - Capability list (sub-directories under `specs/`).

4. **Merge-method preflight**

   Determine the repo's merge-method setting. Prefer the GitHub API:

   ```bash
   gh api repos/{owner}/{repo} --jq '{squash: .allow_squash_merge, merge: .allow_merge_commit, rebase: .allow_rebase_merge}'
   ```

   Derive `{owner}/{repo}` from `git remote get-url origin`.

   - If exactly one method is allowed → that is the merge-method.
   - If multiple are allowed → check `design.md`'s `## Delivery shape`. If
     the design picks one, honor it. Otherwise this is a must-ask class:
     use the **AskUserQuestion tool** to ask the user which method the team
     uses in practice.
   - If `gh` is unavailable, unauthenticated, or returns ambiguous settings,
     use the **AskUserQuestion tool** to prompt the user explicitly. Do not
     silently default.

5. **Resolve must-ask classes**

   The plan skill treats these as **must-ask** classes per the ambiguity
   contract (`openspec/config.yaml` `ambiguity:`). If they cannot be derived
   from the artifacts or repo settings above, stop and ask:
   - Sub-PR strategy: `one big PR` / `per-capability stack` /
     `per-capability parallel`.
   - Intermediate-PR build gate: `lint-only` / `lint+test` / `lint+test+build`.
   - Stop conditions: which capability boundaries pause for human input.

6. **Compose `plan.md`**

   Write `openspec/changes/<name>/plan.md` with this structure:

   ```markdown
   # Execution Plan: <change-name>

   ## Branch strategy
   - **PR shape**: <one big PR | per-capability stack | per-capability parallel | per-service stack>
   - **Base branch**: <main | integration branch name>
   - **Integration branch**: <name, or N/A>
   - **Repo merge-method**: <squash | merge | rebase>
   - **Intermediate-PR build gate**: <lint-only | lint+test | lint+test+build>

   ## Skill invocations per boundary
   - **Propose-end** (artifacts done): <skills, e.g. /opsx:plan>
   - **Capability-start** (per capability): <skills, e.g. /opsx:apply <capability>>
   - **Capability-end** (per capability): <skills, e.g. /opsx:review, /opsx:pr>
   - **Archive**: <skills, e.g. /opsx:archive, /opsx:summarize>

   ## Stop conditions
   - <named pause point 1 — e.g. "before deleting legacy entry point">
   - <named pause point 2>

   ## Rebase recipe
   <!-- Include the verbatim block below ONLY when PR shape is
        `per-capability stack` AND merge-method is `squash`. Omit otherwise. -->
   When the previous capability's PR is squash-merged into the base branch,
   each remaining stacked branch must be rebased onto the new base SHA so
   the squashed commit does not appear as a conflict. Run this for every
   downstream branch in order:

   ```bash
   git fetch origin
   git checkout <downstream-branch>
   git rebase --onto origin/<base-branch> <prev-branch> <downstream-branch>
   git push --force-with-lease
   ```

   Expected rebase volume: O(N) where N is the number of remaining stacked
   branches. Budget ~5 minutes per rebase to confirm the diff.

   ## Decisions made without consultation
   <!-- Include this section ONLY when at least one may-decide call was made
        while authoring this plan. Omit entirely otherwise. -->
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

   Then echo the full plan body to the terminal.

**Output contract**

- `openspec/changes/<change-name>/plan.md` exists with every required field
  filled.
- Print the path on success.
- If `applyRequires` artifacts are not done, print the missing artifacts
  and do NOT write `plan.md`.
- If the rebase recipe applies (stack + squash), the verbatim block above
  appears in the plan.

**Ambiguity escalation contract (plan-time)**

The plan skill treats the following as **must-ask** classes per
`openspec/config.yaml` `ambiguity:`:

- Repo merge-method when not derivable from `gh api`.
- Sub-PR strategy when `design.md` is silent and no obvious inference exists.
- Intermediate-PR build gate.
- Stop conditions.

Any other choice (e.g. naming derivations for the plan's section headers,
default sentence shapes) is a may-decide class — proceed with a reasonable
default AND log the decision in the plan's
`## Decisions made without consultation` section. The marker section is
omitted entirely when no may-decide calls were made.

**Guardrails**

- Do NOT add `plan` to the change's `applyRequires`. The artifact remains
  optional.
- Do NOT author or modify `proposal.md`, `design.md`, `specs/`, or
  `tasks.md` — only consume them. Author `plan.md` only.
- Stop on must-ask classes; do not silently default merge-method, sub-PR
  strategy, build gate, or stop conditions.
- The rebase recipe MUST appear verbatim when strategy is
  `per-capability stack` and merge-method is `squash`.
- If the user explicitly overrides the plan during `/opsx:apply`, treat the
  override as a must-ask class — surface the conflict per the contract.

**Fluid Workflow Integration**

- **Optional**: not in `applyRequires`. `/opsx:apply` proceeds without a
  plan with no warning.
- **Re-runnable**: invoke again when delivery shape changes mid-implementation
  (e.g. scope expansion, new capability added). The new plan overwrites the
  old one.
- **Composable**: pairs with `/opsx:apply` (which reads named stop
  conditions) and `/opsx:pr` (which honors the chosen sub-PR strategy and
  merge-method).

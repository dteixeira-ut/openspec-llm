# Rebase recipe: stacked PRs after squash-merge

## When this applies

This recipe applies whenever **both** of the following are true:

- Delivery shape is a **per-capability stack** of PRs (PR #N+1 branches from PR #N, not from `main`).
- Repo merge-method is **squash** (the integration branch ends up with one commit per merged PR, not the original commit hashes).

Under those conditions, when PR #N squash-merges into the integration branch, PR #N+1's branch contains the **original** N commits while the integration branch now contains the **squashed** version. The differing commit hashes make `git rebase` see "the same changes" twice — once in the parent's squashed commit and once in PR #N+1's original commits. Most of those reapplications conflict trivially, but they all need a resolution.

This recipe is the resolution procedure. **Do not re-derive it by hand each time** — follow it verbatim.

## The `--ours` vs `--theirs` rule

During the rebase, `--ours` and `--theirs` mean the **opposite** of what intuition suggests:

- `--ours` = the branch being rebased **onto** (the integration branch with the squash-merge).
- `--theirs` = the branch being rebased (PR #N+1, the stacked PR).

Therefore: **always pick `--ours`** when resolving conflicts in files owned by an earlier capability in the stack. The squash-merged version is canonical; the stacked PR's original commits are the duplicates.

For files owned **only** by the stacked PR (new files that no earlier PR touches), there will be no conflict — they replay cleanly.

## The verbatim command loop

Run from the directory of the stacked PR's local checkout:

```bash
# 1. Fetch the latest integration branch state (includes the squash-merge commit)
git fetch origin <integration-branch>

# 2. Switch to the stacked PR's branch (if not already on it)
git checkout <stacked-pr-branch>

# 3. Start the rebase onto the integration branch
git rebase origin/<integration-branch>

# 4. Conflict-resolution loop — repeat until rebase completes
#    For each conflict:
git checkout --ours <conflicting-file>           # take the integration-branch version
git add <conflicting-file>
git rebase --continue

# 5. When the rebase completes, force-push with lease to update the remote PR
git push --force-with-lease
```

If a conflict appears in a file that the stacked PR is **adding new content to** (not just replaying a parent capability's changes), do not blindly take `--ours`. Open the file, manually integrate the new content on top of the squash-merged version, then `git add` and `git rebase --continue`.

## Why `--force-with-lease` and not `--force`

`--force-with-lease` refuses to overwrite the remote if someone else has pushed to it in the meantime. `--force` overwrites unconditionally. In a stacked-PR workflow other people may push fixes to a downstream branch while you're rebasing; the lease protects them.

## Worked example

Stack: foundation PR → capability-A PR → capability-B PR. All against integration branch `migrate-service-foundation`.

1. Foundation PR squash-merges into `migrate-service-foundation`. The squash commit touches `package.json`, `tsconfig.build.json`, `src/main.ts`, `src/app.module.ts`.
2. Capability-A PR's branch still contains its original 4 commits (which also touched `package.json` and `src/app.module.ts` to add capability-A wiring).
3. Run the loop above on capability-A:
   - `git fetch origin migrate-service-foundation`
   - `git checkout capability-a-branch`
   - `git rebase origin/migrate-service-foundation`
   - First conflict: `package.json` — take `--ours` (the squash-merged dependencies are already present). Capability-A's `package.json` changes for capability-A-specific deps will be replayed in a later commit in the rebase; resolve those when they come.
   - Continue until the rebase finishes.
   - `git push --force-with-lease`
4. Repeat for capability-B PR once capability-A has been squash-merged.

## Do not

- Do **not** use `git rebase -i` or any interactive flag — this recipe is non-interactive on purpose.
- Do **not** use `git push --force` (without `--with-lease`).
- Do **not** merge the integration branch into the stacked PR with `git merge`. That preserves the duplicate commits and creates a worse history.
- Do **not** skip the recipe and "just fix it manually" — every stacked PR in a long chain needs the same resolution, and ad-hoc fixes diverge.

# Auditor: `ci-fmt-gate`

## What it checks

When a repo declares an `fmt` (or `fmt:check`) script in `package.json` but no CI workflow invokes it, formatting drifts across PRs because the only enforcement is local — and local is unreliable across editors, OSes, and contributors who forgot to install the hooks. This auditor verifies that the `fmt` script, if declared, is actually run in CI.

## Precondition

- `package.json` exists at the target repo root.
- `package.json` `scripts` includes one of: `fmt`, `fmt:check`, `format`, `format:check`.

If neither precondition holds → `skipped` with reason "no `fmt` script in `package.json`".

## Check logic

1. Read `package.json` `scripts` and identify the `fmt`-family script names present (e.g. `fmt`, `fmt:check`).
2. Find all CI workflow files: `.github/workflows/*.yml`, `.github/workflows/*.yaml`. (Also accept `.gitlab-ci.yml` if no GitHub workflows exist.)
3. For each workflow file, scan `run:` lines for invocations of any of the identified script names. Accept any of:
   - `npm run fmt`, `npm run fmt:check`, `npm run format`, etc.
   - `pnpm fmt`, `pnpm run fmt`, etc.
   - `yarn fmt`, `yarn run fmt`, etc.
   - Direct `npx prettier --check` or `prettier --check` invocations (these count as equivalent — the goal is "formatting is verified in CI," not "this specific script name is invoked").
4. If at least one workflow invokes a fmt-equivalent → `pass`.
5. If `package.json` declares an `fmt` script but **no** workflow invokes any fmt-equivalent → `fail`.

## Failure output shape

```markdown
## ci-fmt-gate: fail

`package.json` declares `scripts.fmt` but no workflow under `.github/workflows/` invokes it.

- Finding: `scripts.fmt` is `"<command>"`. Workflows scanned: `<workflow1>`, `<workflow2>`. None invoke `npm run fmt`, `prettier --check`, or equivalent.
  - Fix: add a `- run: npm run fmt -- --check` step (or equivalent for the package manager in use) to the lint job in `<workflow1>` (or the workflow that already runs `lint`).
```

## One-line fix

Add a `- run: npm run fmt -- --check` step (or `pnpm fmt --check`, `yarn fmt --check`) to whichever workflow already runs `lint` or `test`. Prefer `--check` mode over the formatting mode so CI fails on drift rather than silently rewriting files.

## Notes

- If the `fmt` script is the **write** variant (`prettier --write .`) and there's no separate `--check` variant, the auditor still considers CI invocation valid — but flag a warning that running `--write` in CI is wasteful (it modifies files in the CI runner, then discards them). Recommend adding a `fmt:check` script.
- The auditor does **not** distinguish between formatting that's a hard gate (PR fails) and formatting that's a soft signal (PR passes with warning). Either counts as a `pass` — the goal is awareness, not enforcement of a specific gate strictness.
- For repos using `pre-commit` hooks **and** CI, this auditor still requires the CI invocation. Hooks are unreliable (skipped via `--no-verify`, not installed in fresh clones); CI is the durable gate.

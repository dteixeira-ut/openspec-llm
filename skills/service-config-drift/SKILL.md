---
name: service-config-drift
description: Audits a TypeScript backend repo for three categories of config drift that bite at deploy time — prettier parser plugins for decorator support, Dockerfile entrypoint validity, and CI fmt-gate presence. Use when reviewing a service's config hygiene, before a release, or as part of a migration's Step 0.
license: MIT
compatibility: Repo-agnostic. Expects a TS service repo with a package.json. Each auditor self-skips if its precondition isn't met.
metadata:
  author: insight-out
  version: "1.0"
---

# `service-config-drift`

This skill runs three auditors in a single invocation against a target TypeScript backend repo, then emits one consolidated hygiene report. Each auditor catches a class of configuration mismatch that **builds clean and breaks at deploy time** — the worst kind of bug.

## Repo-agnostic self-check

This skill names **file categories**, not paths from any specific repo. Each auditor describes what kind of file it looks at (`.prettierrc` in its various forms, `Dockerfile`s, workflows under `.github/workflows/`), not paths from any one project. If you are about to record "the `enriched-video-uploads-v2/.prettierrc`" or similar repo-bound path in the skill body or an auditor doc, stop — name the category instead.

## When to use this skill

- Reviewing a TS service repo's config hygiene before a release.
- As part of the `migrate-to-nestjs` skill's Step 0 (the auditor findings inform the reconciliation commit).
- As a periodic drift check (run by hand or via a scheduled agent).
- Investigating a deploy-time failure that smells like a config issue.

Do **not** use this skill for:

- Frontend repos (none of the three auditors are useful there).
- Repos that don't have a `package.json` (the auditors short-circuit but produce no signal).

## Inputs

- **Target repo** — either the current working directory or an explicit path supplied as an argument.

## Outputs

A single markdown report with one section per auditor. Each section reports:

- **Status** — `pass`, `fail`, or `skipped`.
- **Findings** — a bullet list of detected issues (empty for `pass`).
- **One-line fix** — for each finding, the smallest change that resolves it.

The skill never modifies the target repo. It is read-only by design.

## Procedure

1. **Resolve the target repo path.** If the user did not supply one, use the current working directory. Confirm `package.json` exists at the root; if not, report `skipped` for the whole skill with reason "no `package.json` at target path".

2. **Run each auditor in turn**, in the order below. Each auditor is documented in its own file under [`auditors/`](./auditors/). Do not let one auditor's `fail` or `skipped` status stop the others — collect all three results before emitting the report.

   1. [`prettierrc-parser-plugins`](./auditors/prettierrc-parser-plugins.md) — verifies that when decorator usage is present, the prettier config's `importOrderParserPlugins` includes `decorators-legacy`.
   2. [`dockerfile-entrypoint`](./auditors/dockerfile-entrypoint.md) — verifies the `Dockerfile` `CMD`/`ENTRYPOINT` references a real source file and that the build stage copies `tsconfig.build.json` and `nest-cli.json` when those exist.
   3. [`ci-fmt-gate`](./auditors/ci-fmt-gate.md) — verifies that when `package.json` declares an `fmt` script, that script is invoked by at least one CI workflow.

3. **Emit the consolidated report** in the shape below.

## Report shape

```markdown
# Service config drift report — `<target-repo-name>`

## prettierrc-parser-plugins: <pass|fail|skipped>

<one-line summary>

- Finding: <what was wrong>
  - Fix: <one-line fix>

## dockerfile-entrypoint: <pass|fail|skipped>

<one-line summary>

- Finding: <what was wrong>
  - Fix: <one-line fix>

## ci-fmt-gate: <pass|fail|skipped>

<one-line summary>

- Finding: <what was wrong>
  - Fix: <one-line fix>

## Summary

<n> pass, <n> fail, <n> skipped. <Optional one-line recommendation, e.g. "Address the failures before the next deploy.">
```

When status is `pass`, the section has no findings — just the one-line summary (e.g. "All decorator-using files are covered by `decorators-legacy` in `.prettierrc`."). When status is `skipped`, give the precondition that wasn't met (e.g. "No `Dockerfile` at target path.").

## Example invocation

Run against a hypothetical service repo that has decorators but no `decorators-legacy` plugin, a valid Dockerfile, and an `fmt` script that CI doesn't invoke:

```markdown
# Service config drift report — `example-service`

## prettierrc-parser-plugins: fail

`.prettierrc` is missing `decorators-legacy` in `importOrderParserPlugins`; repo contains decorator usage.

- Finding: 14 `.ts` files use `@Injectable()` / `@Controller()` / `@Module()`, but `.prettierrc` `importOrderParserPlugins` is `["typescript"]`.
  - Fix: change `importOrderParserPlugins` to `["typescript", "decorators-legacy"]` in `.prettierrc`.

## dockerfile-entrypoint: pass

`Dockerfile` `CMD ["node", "dist/main.js"]` resolves to `src/main.ts`; build stage copies `tsconfig.build.json` and `nest-cli.json`.

## ci-fmt-gate: fail

`package.json` declares `scripts.fmt`, but no workflow under `.github/workflows/` invokes it.

- Finding: `scripts.fmt` is `"prettier --write ."`. Workflows `ci.yml` and `release.yml` run `lint` and `test` but not `fmt`.
  - Fix: add a `- run: npm run fmt -- --check` step to the lint job in `.github/workflows/ci.yml`.

## Summary

1 pass, 2 fail, 0 skipped. Address both failures before the next deploy — both produce non-obvious symptoms (parser plugin: unstable import order across editors; missing CI fmt gate: formatting drift across PRs).
```

## Graduation

This skill should move out of its current incubation home when **any** of:

- A fourth auditor is added (signal that the surface is growing beyond hygiene-spot-checks).
- The auditors need to run as real CI (against fixture repos or against a live repo) rather than agent-interpreted documentation.
- A second org adopts the skill — at that point a shared org skills repo or plugin makes more sense.

Procedure: follow the graduation steps in the host repo's skills README.

# Sibling-file diff checklist (Step 0a of `migrate-to-nestjs`)

This recipe inspects **config-tooling files** (Prettier, ESLint, tsconfig, jest, Dockerfile, CI workflows, `package.json` scripts) in a sibling NestJS reference service and produces a reconciliation commit. See also the companion recipe [`sibling-source-layout-checklist.md`](./sibling-source-layout-checklist.md), which inspects **source conventions** (`src/` layout, module shapes, naming, test layout) and produces a convention manifest. Both recipes run together at Step 0 of the migration.

Fill this checklist in during Step 0a of the migration. The output is the input to the **reconciliation commit** that lands at the start of the foundation PR.

Pick a **sibling reference**: an existing NestJS service in the same org, or a canonical NestJS starter (e.g. `nest new <name>` output) if no sibling exists.

For each row: compare the migrating service's file against the sibling. Record the delta and the action.

## Checklist

### Prettier config

- [ ] File exists? (`.prettierrc`, `.prettierrc.json`, `.prettierrc.js`, or `prettier` block in `package.json`)
- [ ] If the sibling has `importOrderParserPlugins`, does the migrating service include `decorators-legacy`?
- [ ] If the sibling uses a sort-imports plugin (`@trivago/prettier-plugin-sort-imports` or similar), is the same plugin installed and configured?
- [ ] **Action**: add missing plugin entries to the migrating service's prettier config.

### ESLint config

- [ ] Flat config (`eslint.config.*`) or legacy (`.eslintrc.*`) — which does the sibling use?
- [ ] If they differ, decide: keep the migrating service's choice, or align to the sibling? (Defer the choice if it would block the foundation PR.)
- [ ] Are the NestJS-aware rules present (`@typescript-eslint/no-unused-vars` configured for decorator parameters, `@typescript-eslint/no-floating-promises` for async handlers)?
- [ ] **Action**: align ESLint config to sibling where the difference would catch real bugs in NestJS code.

### TypeScript config — base

- [ ] `tsconfig.json` exists? `experimentalDecorators` and `emitDecoratorMetadata` set to `true`?
- [ ] `strict` flag aligned with sibling?
- [ ] `paths` / `baseUrl` aligned with sibling's monorepo style (flat vs Nx vs workspaces)?
- [ ] **Action**: enable decorator flags if missing; align strictness if sibling is stricter (looser is usually fine).

### TypeScript config — build

- [ ] `tsconfig.build.json` exists? (NestJS uses this to exclude tests from production build.)
- [ ] If missing, add a `tsconfig.build.json` that extends `tsconfig.json` and excludes `**/*.spec.ts`, `**/*.test.ts`, and the test directory.
- [ ] **Action**: create `tsconfig.build.json` if absent.

### Test runner config

- [ ] `jest.config.*` or `vitest.config.*` exists?
- [ ] Aligned with sibling on transformer (`ts-jest`, `swc`, `babel-jest`)?
- [ ] `testRegex` or `testMatch` covers the test layout the migration will produce?
- [ ] **Action**: align transformer choice unless a strong reason to diverge.

### Container artifacts — Dockerfile

- [ ] `Dockerfile` exists? Multi-stage build?
- [ ] Build stage runs `nest build` (or `npm run build` where the script invokes `nest build`)?
- [ ] `COPY` instructions in the build stage include `tsconfig.build.json` and `nest-cli.json` when those files exist?
- [ ] `CMD` references the new NestJS entrypoint (`dist/main.js` or equivalent) — note: this stays as the legacy entrypoint until the final cutover PR.
- [ ] **Action**: add missing `COPY` instructions in the reconciliation commit. Defer `CMD` change to the cutover PR.

### Container artifacts — `.dockerignore`

- [ ] Excludes `node_modules`, `dist`, `coverage`, `.git`, test files?
- [ ] Aligned with sibling?
- [ ] **Action**: align with sibling.

### CI workflows

- [ ] Are there workflows that run `lint`, `test`, `build`?
- [ ] If `package.json` has an `fmt` script, is it invoked in CI? (If not, flag for the `service-config-drift` skill's `ci-fmt-gate` auditor.)
- [ ] Are workflows triggered on PRs against the integration branch (not just `main`)?
- [ ] **Action**: extend triggers to cover the integration branch; add `fmt` invocation if missing.

### `package.json` scripts

- [ ] `start` script — does it point at the new NestJS entrypoint? (Defer until cutover.)
- [ ] `start:dev` script — does it use `nest start --watch`?
- [ ] `start:prod` script — does it run `node dist/main.js` (or equivalent)?
- [ ] `build` script — does it invoke `nest build`?
- [ ] `test`, `test:watch`, `test:cov`, `test:e2e` — aligned with sibling?
- [ ] `lint`, `lint:fix`, `fmt`, `fmt:check` — aligned?
- [ ] **Action**: add NestJS-style scripts; leave the legacy `start` script in place under a different name (`start:legacy`) until cutover.

## Output

Produce a single commit titled along the lines of `chore(service): reconcile config with NestJS sibling reference (RAD-XXXXX)`. The commit body should list the deltas applied, grouped by category above. No NestJS source files are added in this commit.

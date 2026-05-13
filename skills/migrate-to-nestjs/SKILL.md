---
name: migrate-to-nestjs
description: Procedure for migrating an existing TypeScript backend service (Express HTTP, hand-rolled @grpc/grpc-js gRPC, or similar) to NestJS as a from-scratch rewrite. Use when a service has chosen NestJS as its target framework and needs a stacking workflow proven across a real migration.
license: MIT
compatibility: Repo-agnostic. Expects a TS service repo with an OpenSpec workflow available, npm/pnpm/yarn package manager, and a CI surface that can run lint and tests on PRs.
metadata:
  author: openspec-llm
  version: "1.0"
---

# `migrate-to-nestjs`

This skill codifies the procedure for migrating a TypeScript backend service to NestJS as a from-scratch rewrite, structured as an OpenSpec change with stacked sub-PRs and per-PR build gates.

## Repo-agnostic self-check

This skill names **file categories**, not paths from any specific repo. Before you write a path that begins with a project name, stop:

- "Edit `video-uploads-service/src/main.ts`" → ✗ binds to one repo.
- "Edit the NestJS bootstrap file (typically `src/main.ts` in a flat layout, `apps/<name>/src/main.ts` in an Nx layout)" → ✓ portable.

If you are about to write a path that only exists in one repo, replace it with the **category** (what kind of file it is) and an example of where it usually lives. The consumer repo's own documentation owns concrete paths.

## When to use this skill

Use when **all** of the following are true:

- Target codebase is an existing Node.js TypeScript backend service.
- Current framework is Express HTTP or hand-rolled `@grpc/grpc-js` gRPC (or similar non-NestJS surface).
- The task is a **from-scratch rewrite** onto NestJS — not a strangler/partial migration.
- An OpenSpec workflow is available in the repo so capabilities can be stacked.

Do **not** use this skill for:

- Nx-managed monorepos — see `nest-nx-controller-scaffold` instead.
- Frontend apps or libraries.
- Greenfield NestJS projects (no migration involved).
- Partial or strangler migrations where the legacy service keeps running alongside the new one.

## Inputs

- Read access to the legacy service source tree.
- A sibling reference NestJS service in the same org (or a canonical NestJS service starter) for Step 0 inspection.
- A clear list of legacy capabilities to migrate (HTTP routes, gRPC methods, Kafka consumers, scheduled jobs, etc.).

## Outputs

- One OpenSpec change per capability, stacked as a chain of PRs against an integration branch.
- A foundation PR that establishes Nest scaffolding, then one PR per migrated capability.
- A reconciliation commit (the Step 0 output) before any NestJS source is added.
- A final cutover PR that switches the deploy entrypoint to the new service.

## Procedure

### Step 0 — Sibling-file inspection

Before authoring **any** NestJS source code, inspect the migrating service's configuration files against a sibling reference. The goal is a single **reconciliation commit** that fixes config drift so subsequent NestJS work isn't blocked by tooling surprises.

Inspect these file categories (paths vary by repo):

- **Prettier config** — `.prettierrc`, `.prettierrc.json`, `.prettierrc.js`, or a `prettier` block in `package.json`.
- **ESLint config** — `eslint.config.*` (flat) or `.eslintrc.*` (legacy).
- **TypeScript config** — `tsconfig.json` (base) and `tsconfig.build.json` (build-time overrides). NestJS uses `tsconfig.build.json` to exclude tests.
- **Test runner config** — `jest.config.*` or `vitest.config.*`.
- **Container artifacts** — `Dockerfile`, `.dockerignore`.
- **CI workflows** — anything under `.github/workflows/`, `.gitlab-ci.yml`, or equivalent.
- **`package.json` scripts** — particularly `start`, `start:dev`, `start:prod`, `build`, `test`, `lint`, `fmt`.

For each category, diff the migrating service against the sibling reference and capture the deltas in a checklist. The checklist itself lives at [`recipes/sibling-file-diff-checklist.md`](./recipes/sibling-file-diff-checklist.md).

Produce **one reconciliation commit** that:

- Adds missing prettier parser plugins (e.g. `decorators-legacy` when the sibling has it).
- Adds `tsconfig.build.json` if missing.
- Adds `nest-cli.json` if missing.
- Aligns ESLint config to the sibling's flat/legacy choice.
- Adds the NestJS-style `start:*` scripts to `package.json`.
- Updates `Dockerfile` `COPY` instructions to include `tsconfig.build.json` and `nest-cli.json` when those files exist.

Do **not** add any NestJS source files in this commit. The reconciliation is intentionally separate so a reviewer can see "tooling parity reached" before code lands.

### Step 1 — Foundation PR

The first PR adds the NestJS skeleton but **no migrated capabilities yet**:

- `package.json` adds `@nestjs/core`, `@nestjs/common`, and the chosen extras (e.g. `@nestjs/microservices`, `nestjs-pino`, `nestjs-zod`).
- `src/main.ts` (or equivalent) bootstraps the NestJS app.
- `src/app.module.ts` declares the root module (empty `imports` array initially).
- Wiring for the resolved library choices: `nestjs-pino` for logging, `nestjs-zod` for validation, `@nestjs/microservices` for gRPC/Kafka transports, Drizzle (or the existing ORM) wired as a Nest provider, `dd-trace` for APM.
- The legacy entrypoint is **left running** — both services build, only one is wired to the deploy target.

The foundation PR's build gate is **lint-only** because no capability is yet runnable end-to-end.

### Step 2..N — Per-capability slicing

Each subsequent PR migrates **one capability** — one HTTP route group, one gRPC service method group, one Kafka consumer, etc. Pick the capability slice based on cohesion:

- All routes that share a controller.
- All methods that share a domain.
- One Kafka topic's consumer + the domain it dispatches to.

Per capability, the PR includes:

- A NestJS controller / microservice handler.
- The domain layer (pure business logic).
- The repository / infrastructure layer.
- Tests at all three layers.
- Wiring in `AppModule`.

The legacy implementation of that capability is **deleted** in the same PR (this is a from-scratch rewrite, not a strangler).

### Step 3 — Per-PR build gate

Build gates are tuned to avoid burning CI on every intermediate stacked PR:

| PR position | Build gate |
|---|---|
| Foundation PR | `lint` only (nothing is runnable yet). |
| Intermediate capability PRs | `lint` only on each PR; the full `lint + test + build` runs on the integration branch after merge. |
| Final cutover PR | Full `lint + test + build`, plus a manual smoke test against a deployed copy. |

This is critical: running the full test suite on every intermediate stacked PR multiplies CI cost by N and produces redundant signal, because the integration branch's CI catches any breakage post-merge.

### Step 4 — AppModule bootstrap order

Order modules in `AppModule.imports` so providers that other providers depend on are imported first. A reliable order:

1. Config module (loads env into a strongly-typed config object).
2. Logging module (`nestjs-pino` or equivalent) — many other modules log during init.
3. Database module (Drizzle provider).
4. Infrastructure modules (Kafka client, Uploadcare client, gRPC clients to other services).
5. Domain modules (one per migrated capability).
6. Transport modules (HTTP controllers, gRPC microservices, Kafka consumers) **last**, so they don't accept traffic before dependencies are ready.

### Step 5 — Final cutover

The last PR in the stack:

- Removes the legacy entrypoint.
- Updates `Dockerfile` `CMD` to point at the NestJS `dist/main.js` (or equivalent).
- Updates the deploy target's start command if it differs from the Dockerfile `CMD`.
- Runs the full `lint + test + build` gate.

After merge, the legacy code is gone and the NestJS service owns the deploy.

### Step 6 — Stacked-PR rebase

When the parent PR squash-merges into the integration branch, all downstream stacked PRs get conflicts. Recover them using the recipe at [`recipes/rebase-stacked-squash.md`](./recipes/rebase-stacked-squash.md) — do **not** re-derive the resolution by hand each time.

## Migration-specific must-ask classes

These are ambiguity classes that are **always must-ask** during a NestJS migration. They supplement the general OpenSpec ambiguity contract; if any of these arises, stop and ask the user — do not silently choose.

- **Library surface mismatch** — the spec calls a method on a library type, but the installed version's TypeScript signature does not include that method. *Do not* silently rename, no-op, or swap libraries. Ask whether to bump the dependency or change the spec.
- **Scenario contradicts legacy** — a delta-spec scenario specifies behavior that the legacy file it references does not actually produce. Ask whether the spec is correcting a legacy bug or the spec author misread the legacy.
- **`tsconfig.build.json` or `nest-cli.json` divergence** — a setting in the migrating service differs from the sibling reference in a way that affects build output (e.g. different `outDir`, different `assets` array). Ask whether to align with the sibling or preserve the divergence.
- **Dangling Dockerfile `CMD`** — the Dockerfile's `CMD ["node", "dist/<x>.js"]` references a source file that an earlier task in this stack has deleted. Ask whether to update the `CMD` now or defer to the cutover PR.
- **Transitive → direct dependency promotion** — a transitive dependency must be promoted to a direct dependency to keep the build green (e.g. a peer dep that Nest needs explicitly). Ask before adding to `package.json`; document the reason in the commit.

## Graduation

This skill should move out of `openspec-llm` when **any** of:

- A second NestJS migration in a different org adopts the skill (multi-author signal).
- The skill needs fixture repos for CI validation (e.g. running through an end-to-end migration in a test repo).
- The migration patterns diverge enough from spec-driven development that the skill no longer assumes an OpenSpec workflow.

Procedure: follow the graduation steps in [`../README.md`](../README.md#graduation-procedure).

## Open questions

- Should the skill prescribe a specific dependency-injection style for tests (`Test.createTestingModule` everywhere vs. plain manual instantiation)? Deferred until a second migration provides a counter-example.
- Should the per-PR build gate be encoded as a CI matrix entry so it's enforced mechanically? Deferred — currently relies on the orchestrator's discipline.

## Decisions made without consultation

While authoring this skill body:

1. The library choices listed in Step 1 (`nestjs-pino`, `nestjs-zod`, `@nestjs/microservices`, Drizzle, `dd-trace`) are stated as the **resolved choices** from the prior migration, not as the only valid choices. A future migration may swap any of them; the skill names them as defaults rather than mandates.
2. The build-gate table uses a three-row split (foundation / intermediate / cutover). An earlier draft had only two rows (intermediate / cutover); the foundation row was added because the foundation PR's gate is even narrower — nothing is runnable, so even `lint` is the only check that produces signal.
3. The AppModule bootstrap order (Step 4) is presented as **a** reliable order, not **the** reliable order. Repos with unusual dependencies (e.g. a Kafka consumer that feeds the config module) may need to deviate; the skill flags this as an open question rather than enforcing it.
4. Step 0 produces "one reconciliation commit" rather than "one reconciliation PR." A separate PR would surface tooling parity before NestJS code lands, but doubles the PR count. The single-commit-in-foundation-PR shape is the compromise.
5. The "must-ask" framing uses "stop and ask the user" wording rather than "raise a clarification request" because the orchestrator typically has a human in the loop; the more direct phrasing reduces ambiguity.

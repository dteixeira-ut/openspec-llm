---
name: migrate-to-nestjs
description: Procedure for migrating an existing TypeScript backend service (Express, hapi, Mali, hand-rolled @grpc/grpc-js, or ApolloServer) to NestJS as a from-scratch rewrite. Use when a service has chosen NestJS as its target framework and needs a stacking workflow proven across a real migration.
license: MIT
compatibility: Repo-agnostic. Expects a TS service repo with an OpenSpec workflow available, npm/pnpm/yarn package manager, and a CI surface that can run lint and tests on PRs.
metadata:
  author: usertesting-arch
  version: "1.1"
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

- Target codebase is an existing Node.js TypeScript backend service. The source language MUST be TypeScript on Node.js — per the deploying organization's languages standardization, TypeScript/Node.js is the ADOPT general-purpose language. Migrations from other source languages are out of scope.
- Current framework is one of the legacy backend frameworks on the deploying organization's HOLD list and eligible for Nest.js migration. For UserTesting (per the Framework Standardization page) this is:
  - Express (HTTP)
  - hapi (HTTP)
  - Mali (gRPC)
  - hand-rolled `@grpc/grpc-js` (grpcServer)
  - ApolloServer (GraphQL)
- The task is a **from-scratch rewrite** onto NestJS — not a strangler/partial migration.
- An OpenSpec workflow is available in the repo so capabilities can be stacked.

Do **not** use this skill for:

- Nx-managed monorepos — see `nest-nx-controller-scaffold` instead.
- Frontend apps or libraries.
- Greenfield NestJS projects (no migration involved).
- Partial or strangler migrations where the legacy service keeps running alongside the new one.
- Migrations from non-TypeScript source languages.

## Inputs

- Read access to the legacy service source tree.
- A clear list of legacy capabilities to migrate (HTTP routes, gRPC methods, Kafka consumers, scheduled jobs, etc.).
- A **source-stack descriptor** (see below) that names which transport/persistence/queue/validation surfaces the migrating service uses.
- An **OPTIONAL** sibling reference NestJS service path (see `referenceCodebase` below). If omitted, the skill falls back to NestJS documentation defaults with an explicit retrofit-risk warning — but the migration is NOT blocked.

### Source-stack descriptor

The skill consumes a fixed-shape descriptor that drives capability slicing. Each slot is optional; values are drawn from a **closed list**:

```yaml
sourceStack:
  http:      express | fastify | koa | hapi | apollo-server | none
  rpc:       grpc-js | mali | none
  orm:       drizzle | typeorm | prisma | knex | none
  queue:     kafka | sqs | rabbitmq | none
  validator: zod | class-validator | joi | none
```

If the planner needs to use a value not in this closed list (for example, `http: mercurius`, `orm: mongoose`, or `queue: bull`), the skill MUST STOP and surface a must-ask "descriptor slot `<slot>` value `<value>` is not in the closed list — extend the list or use a documented value." Do not improvise mappings.

### `referenceCodebase` (optional)

`referenceCodebase`: an absolute filesystem path to a sibling NestJS service in the same organization, OR omitted entirely. The field is **optional, not required-by-default** — not every team has a NestJS reference service to point at, and gating adoption on one would block teams whose Nest adoption is fresh.

When omitted, the agent MUST emit this verbatim warning in the proposal it drafts:

> No sibling NestJS reference was provided. The skill is proceeding with NestJS documentation defaults. Known risk: docs-idiomatic output may diverge from your codebase conventions; expect 1–3 retrofit cycles per service post-foundation.

The warning informs the team of the tradeoff but does NOT block the migration. The source-layout checklist (Step 0b) still runs; its convention manifest records "default per NestJS docs" rather than "per sibling at `<path>`."

## Outputs

- One OpenSpec change per capability, stacked as a chain of PRs against an integration branch.
- A foundation PR that establishes Nest scaffolding, then one PR per migrated capability.
- A reconciliation commit (the Step 0a output) before any NestJS source is added.
- A convention manifest markdown document (the Step 0b output) attached to the foundation proposal.
- A final cutover PR that switches the deploy entrypoint to the new service.

## Procedure

### Step 0a — Sibling-file inspection (config tooling)

Before authoring **any** NestJS source code, inspect the migrating service's configuration files against a sibling reference (or a `nest new` canonical starter if no sibling was supplied). The goal is a single **reconciliation commit** that fixes config drift so subsequent NestJS work isn't blocked by tooling surprises.

Inspect these file categories (paths vary by repo):

- **Prettier config** — `.prettierrc`, `.prettierrc.json`, `.prettierrc.js`, or a `prettier` block in `package.json`.
- **ESLint config** — `eslint.config.*` (flat) or `.eslintrc.*` (legacy).
- **TypeScript config** — `tsconfig.json` (base) and `tsconfig.build.json` (build-time overrides). NestJS uses `tsconfig.build.json` to exclude tests.
- **Test runner config** — `jest.config.*` or `vitest.config.*`.
- **Container artifacts** — `Dockerfile`, `.dockerignore`.
- **CI workflows** — anything under `.github/workflows/`, `.gitlab-ci.yml`, or equivalent.
- **`package.json` scripts** — particularly `start`, `start:dev`, `start:prod`, `build`, `test`, `lint`, `fmt`.

The full checklist lives at [`recipes/sibling-file-diff-checklist.md`](./recipes/sibling-file-diff-checklist.md). Output: one reconciliation commit before any NestJS source files are added.

### Step 0b — Sibling source-layout inspection (conventions)

In parallel with Step 0a, inspect the sibling reference's **source conventions** — the items that determined retrofit cycles on past migrations when left implicit:

- `src/` directory layout shape (common/infra/features split vs flat).
- Configuration module shape (singleton vs DI; zod-validated vs interface; file-loader location).
- Logger module shape (`forRoot` vs `forRootAsync`; field decoration).
- Exception filter shape (platform-agnostic via `HttpAdapterHost` vs platform-specific).
- Test layout (colocated `*.spec.ts` vs separate `test/` tree).
- Test infrastructure placement (`src/test/*` with `tsconfig.json` paths alias vs root `test/`).
- File naming conventions (PascalCase vs kebab-case; suffix patterns).

The full checklist lives at [`recipes/sibling-source-layout-checklist.md`](./recipes/sibling-source-layout-checklist.md). Output: a single **convention manifest** markdown document attached to the foundation proposal (NOT a commit — the manifest is a planning artifact the foundation PR consumes during code generation).

When `referenceCodebase` is omitted, the manifest records "default per NestJS docs" entries; the inspection step itself is preserved so the same artifact shape consumes downstream.

### Step 0.5 — Load org-normative rules (invoke `ut-standards`)

Before authoring spec-level requirements for any HTTP/RPC/persistence-flavor capability, the agent MUST invoke the sibling skill [`ut-standards`](../ut-standards/SKILL.md) via the host runtime's Skill-invocation primitive. The invocation loads the deploying organization's authoritative rule bodies into the agent's context so downstream capability specs and implementation tasks can cite specific rule names (e.g. `error-shape`, `audience-prefix`, `idempotency-key`) by stable identifier.

**Fallback path**: when the host runtime does not expose a Skill-invocation primitive (e.g. an editor or CLI without sub-skill support), the agent SHALL READ `skills/ut-standards/SKILL.md` end-to-end at this step. The downstream rule-name citations behave identically.

### Step 0.7 — Capability derivation

Given the source-stack descriptor, derive the foundation's capability set using the table below. The table is **authoritative**: if the foundation proposal's capability set differs from the table's output, the proposal MUST justify the deviation in its `## Decisions made without consultation` section.

| Descriptor slot value | Adds to foundation capabilities |
|---|---|
| `http: express \| fastify \| koa \| hapi` | `bootstrap`, `config`, `logger`, `validation`, `exception-filter`, `<smoke>-controller` |
| `http: apollo-server` | (above) + `graphql-module` |
| `rpc: grpc-js \| mali` | `grpc-server`, `grpc-exception-filter`, `<smoke>-rpc-controller` |
| `orm: drizzle \| typeorm \| prisma \| knex` | `database` |
| `queue: kafka \| sqs \| rabbitmq` | `<queue>-module` (subscribers wired in a follow-up change, not the foundation) |
| `validator: zod` | folded into the `validation` capability above |
| `validator: class-validator \| joi` | `validation` capability uses the corresponding adapter |
| (always present) | `test-scaffolding` — the final PR; assembles `AppModule` + `main.ts`, runs the integration smoke test. |

### Step 1 — Foundation PR

The first PR adds the NestJS skeleton but **no migrated capabilities yet**:

- `package.json` adds `@nestjs/core`, `@nestjs/common`, and the chosen extras (e.g. `@nestjs/microservices`, `nestjs-pino`, `nestjs-zod`).
- `src/main.ts` (or equivalent) bootstraps the NestJS app.
- `src/app.module.ts` declares the root module (empty `imports` array initially).
- Wiring for the resolved library choices: `nestjs-pino` for logging, `nestjs-zod` for validation, `@nestjs/microservices` for gRPC/Kafka transports, the chosen ORM wired as a Nest provider, `dd-trace` (or equivalent APM) imported as the first statement in `main.ts`.
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
3. Database module (chosen ORM provider).
4. Infrastructure modules (Kafka/SQS/RabbitMQ client, gRPC clients to other services, third-party SDKs).
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

## Standards cross-reference

This skill DEFERS to the sibling [`ut-standards`](../ut-standards/SKILL.md) skill for the deploying organization's authoritative rules. The rules below are listed by name only; consult `ut-standards` for the rule bodies.

For HTTP-flavor migrations (when `sourceStack.http` is populated with any non-`none` value), the produced migration MUST honor:

- `audience-prefix` — URIs prefixed `/app|/admin|/api|/internal` per audience category. The skill MUST ASK the user which audience category applies if not stated.
- `uri-versioning` — `/v<n>/` segment in URIs.
- `error-shape` — global exception filter produces `{ error: { code, message, target } }`. If legacy returns a divergent shape, the new implementation aligns with the standard and the deviation is documented in the PR body.
- `idempotency-key` — POST creation endpoints accept and dedupe by `Idempotency-Key` header (UUID v4).
- `x-request-id` — services accept and propagate `X-Request-ID`; structured log lines include the value.
- `iso-standards` — timestamps in ISO 8601 UTC; currency ISO 4217; language ISO 639-1; country ISO 3166-1 alpha-2.
- `uuid-v4-ids` — all resource IDs are UUID v4.
- `pagination-shape` — list endpoints return `{ items: [...], meta: { total, limit, offset } }`.
- `action-sub-resources` — non-CRUD operations modeled as `POST /<resource>/{uuid}/<actionVerb>`.
- `monitoring-endpoint` — `GET /<resourceType>/{id}/monitor` where applicable.
- `openapi-spec` — public/customer-facing APIs ship an OpenAPI 3.x spec versioned alongside the URI version.
- `required-resource-attributes` — `id`, `name`, `description`, `createdAt`, `updatedAt` on every resource response.
- `json-content-type` — all requests/responses `application/json`; camelCase JSON property names; top-level JSON object (not array or primitive).
- `read-only-db-for-gets` — all GET operations use read-only database instances.

For RPC-flavor migrations (when `sourceStack.rpc` is populated), the same rule names apply where they translate (error shape, ID format, content type at the gRPC boundary).

For migrations from non-TypeScript source languages, the skill cites `ut-standards`' `typescript-node-is-adopt-general-purpose` rule and refuses the migration as out-of-scope.

**Portability**: an external consumer (outside UserTesting) substitutes `ut-standards` with their organization's equivalent standards skill, and both the Step 0.5 invocation and the rule-name references in this section continue to resolve provided the substitute skill uses the same rule-name vocabulary.

## Migration-specific must-ask classes

These are ambiguity classes that are **always must-ask** during a NestJS migration. They supplement the general OpenSpec ambiguity contract; if any of these arises, stop and ask the user — do not silently choose.

- **Library surface mismatch** — the spec calls a method on a library type, but the installed version's TypeScript signature does not include that method. *Do not* silently rename, no-op, or swap libraries. Ask whether to bump the dependency or change the spec.
- **Scenario contradicts legacy** — a delta-spec scenario specifies behavior that the legacy file it references does not actually produce. Ask whether the spec is correcting a legacy bug or the spec author misread the legacy.
- **`tsconfig.build.json` or `nest-cli.json` divergence** — a setting in the migrating service differs from the sibling reference in a way that affects build output (e.g. different `outDir`, different `assets` array). Ask whether to align with the sibling or preserve the divergence.
- **Dangling Dockerfile `CMD`** — the Dockerfile's `CMD ["node", "dist/<x>.js"]` references a source file that an earlier task in this stack has deleted. Ask whether to update the `CMD` now or defer to the cutover PR.
- **Transitive → direct dependency promotion** — a transitive dependency must be promoted to a direct dependency to keep the build green (e.g. a peer dep that Nest needs explicitly). Ask before adding to `package.json`; document the reason in the commit.
- **Descriptor slot value not in the closed list** — an unmapped value is given for `http`, `rpc`, `orm`, `queue`, or `validator` (e.g. `http: mercurius`, `orm: mongoose`). Do not improvise a mapping; ask whether to extend the closed list or substitute a documented value.
- **Audience category absent for HTTP-flavor migration** — `sourceStack.http` is populated with a non-`none` value but the audience prefix (`app|admin|api|internal`) is not declared. URL routing and gateway behavior depend on the prefix; do not default silently.
- **Error shape conflict between sibling and organization standard** — the sibling reference's exception filter emits an error shape that differs from the organization standard's `error-shape` rule. Ask which shape is authoritative for this migration before generating the filter.
- **Sibling reference layout cannot be expressed by the source-layout recipe** — the sibling uses a layout that doesn't fit the recipe's enumerated categories (e.g. a hexagonal-architecture split with `ports/` and `adapters/`). Ask whether to extend the recipe or settle on the nearest documented shape.

## Graduation

This skill should move out of its current incubation home when **any** of:

- A second NestJS migration in a different org adopts the skill (multi-author signal).
- The skill needs fixture repos for CI validation (e.g. running through an end-to-end migration in a test repo).
- The migration patterns diverge enough from spec-driven development that the skill no longer assumes an OpenSpec workflow.

Procedure: follow the graduation steps in the host repo's skills README.

## Open questions

- Should the skill prescribe a specific dependency-injection style for tests (`Test.createTestingModule` everywhere vs. plain manual instantiation)? Deferred until a second migration provides a counter-example.
- Should the per-PR build gate be encoded as a CI matrix entry so it's enforced mechanically? Deferred — currently relies on the orchestrator's discipline.
- Should the source-stack descriptor be encoded as a fenced YAML block inside the foundation proposal (so an apply-time agent can parse it) or kept as inline prose? Currently inline; revisit if the proposal template grows a dedicated `## Source stack` section.

## Decisions made without consultation

While authoring this skill body:

1. The library choices listed in Step 1 (`nestjs-pino`, `nestjs-zod`, `@nestjs/microservices`, Drizzle as a canonical ORM example, `dd-trace`) are stated as the **resolved choices** from prior migrations, not as the only valid choices. A future migration may swap any of them based on the source-stack descriptor; the skill names them as defaults rather than mandates.
2. The build-gate table uses a three-row split (foundation / intermediate / cutover). The foundation row exists because the foundation PR's gate is even narrower — nothing is runnable, so even `lint` is the only check that produces signal.
3. The AppModule bootstrap order (Step 4) is presented as **a** reliable order, not **the** reliable order. Repos with unusual dependencies may need to deviate; the skill flags this as an open question rather than enforcing it.
4. Step 0a produces "one reconciliation commit" rather than "one reconciliation PR." A separate PR would surface tooling parity before NestJS code lands, but doubles the PR count. The single-commit-in-foundation-PR shape is the compromise.
5. Step 0.5 names the standards-loading step explicitly as a numbered step (`Step 0.5`) rather than folding it into Step 0a or Step 0.7. Naming it separately makes the dependency on `ut-standards` audit-visible in the procedure — every reader sees that capability authoring is gated on rule loading.
6. The descriptor slot list is **closed** (no `other`). Closing the list forces unmapped values into a must-ask; the alternative — open values with prose validation — was rejected because it pushes the agent back to judgment-based slicing, which the descriptor is meant to replace.

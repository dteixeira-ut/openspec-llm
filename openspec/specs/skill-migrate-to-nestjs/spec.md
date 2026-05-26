# skill-migrate-to-nestjs Specification

## Purpose
TBD - created by archiving change add-domain-skills. Update Purpose after archive.
## Requirements
### Requirement: `migrate-to-nestjs` skill SHALL exist at `skills/migrate-to-nestjs/SKILL.md`

A skill named `migrate-to-nestjs` SHALL be present at `skills/migrate-to-nestjs/SKILL.md`, codifying the procedure for migrating a TypeScript backend service to NestJS.

#### Scenario: Skill present
- **WHEN** the change is merged
- **THEN** `skills/migrate-to-nestjs/SKILL.md` SHALL exist and SHALL declare repo-agnostic framing per the `domain-skills-home` capability

### Requirement: The skill SHALL prescribe a Step 0 sibling-file inspection

`SKILL.md` MUST direct agents to inspect the following file categories in the migrating service against a sibling reference (existing NestJS service in the same org, or canonical service starter) before authoring any NestJS code:

- Prettier config (`.prettierrc`, `.prettierrc.json`, or `prettier` block in `package.json`)
- ESLint config (`eslint.config.*`, `.eslintrc.*`)
- TypeScript config (`tsconfig.json`, `tsconfig.build.json`)
- Test runner config (`jest.config.*`, `vitest.config.*`)
- Container artifacts (`Dockerfile`, `.dockerignore`)
- CI workflows (`.github/workflows/*.yml`)
- `package.json` scripts block

The inspection SHALL produce one reconciliation commit before any NestJS source file is added. The file-diff inspection is complemented by the sibling-source-layout inspection described in a separate requirement; the two inspections run together at Step 0 with distinct outputs (the file-diff produces a reconciliation commit; the source-layout produces a convention manifest).

#### Scenario: Missing parser plugin in prettier config
- **WHEN** the sibling reference's prettier config includes `decorators-legacy` in `importOrderParserPlugins` and the migrating service's does not
- **THEN** the skill SHALL direct the agent to add the plugin entry in the reconciliation commit

#### Scenario: Mismatched Dockerfile copy list
- **WHEN** the sibling reference's `Dockerfile` copies `tsconfig.build.json` and `nest-cli.json` into the build stage and the migrating service's does not
- **THEN** the skill SHALL direct the agent to add those copies in the reconciliation commit

#### Scenario: Both inspections run at Step 0
- **WHEN** Step 0 of the skill runs on a migrating service with a sibling reference
- **THEN** the file-diff inspection SHALL produce a reconciliation commit AND the source-layout inspection SHALL produce a convention manifest, both as inputs to the foundation PR

### Requirement: The skill SHALL include the stacked-PR rebase recipe

`SKILL.md` MUST reference a recipe at `skills/migrate-to-nestjs/recipes/rebase-stacked-squash.md` that documents how to recover downstream stacked PRs after the parent PR is squash-merged.

The recipe MUST include:
- The `--ours` vs `--theirs` rule (always `--ours` when resolving conflicts in files owned by an earlier capability)
- The verbatim command loop (`git fetch`, `git checkout`, `git rebase`, conflict-resolution loop, `git push --force-with-lease`)
- A warning that the recipe applies whenever delivery shape is `per-capability stack` and repo merge-method is `squash`

#### Scenario: Stacked PR has conflicts after parent squash-merge
- **WHEN** an orchestrator notes that PR #N+1 has conflicts after PR #N squash-merges into the integration branch
- **THEN** the orchestrator SHALL follow `skills/migrate-to-nestjs/recipes/rebase-stacked-squash.md` to resolve, not re-derive the resolution

### Requirement: The skill SHALL define migration-specific must-ask classes

`SKILL.md` MUST list ambiguity classes that are must-ask under any NestJS migration, supplementing the general ambiguity contract from the workflow:

- A library method named in the spec does not exist in the installed library version.
- A spec scenario contradicts behavior in the legacy file the spec references.
- A `tsconfig.build.json` or `nest-cli.json` setting differs from the sibling reference.
- The `Dockerfile` `CMD` references a `dist/<x>.js` file whose `src/<x>.ts` source has been deleted by an earlier task.
- A transitive dependency must be promoted to a direct dependency to keep the build green.

#### Scenario: Library surface mismatch
- **WHEN** an agent finds the spec calls `Producer.disconnect()` but the installed `@usertestingenterprise/kafka-client` `Producer` interface has no such method
- **THEN** the agent SHALL stop and ask the user, not silently implement a no-op or rename

### Requirement: The skill SHALL declare graduation criteria specific to itself

`SKILL.md` MUST include an `## Open questions` or `## Graduation` section listing the conditions under which the skill should move out of `openspec-llm`:
- A second NestJS migration in a different org adopts the skill (multi-author signal)
- The skill needs fixture repos for CI validation
- The migration patterns diverge from spec-driven development specifically

#### Scenario: Graduation triggered
- **WHEN** any graduation condition is met
- **THEN** maintainers SHALL follow the procedure in `skills/README.md` (copy to new home, leave `MOVED.md` stub)

### Requirement: The skill SHALL accept a structured source-stack descriptor

`SKILL.md` MUST document a fixed-shape source-stack descriptor in its `Inputs` section. The descriptor SHALL have the following slots, each optional:

- `http`: one of `express`, `fastify`, `koa`, `hapi`, `apollo-server`, or `none`
- `rpc`: one of `grpc-js`, `mali`, or `none`
- `orm`: one of `drizzle`, `typeorm`, `prisma`, `knex`, or `none`
- `queue`: one of `kafka`, `sqs`, `rabbitmq`, or `none`
- `validator`: one of `zod`, `class-validator`, `joi`, or `none`

The slot list SHALL be closed. When the planner encounters a value not in the closed list (for example, a service on TRPC or Mercurius), the skill SHALL direct the agent to STOP and surface a must-ask of class "descriptor slot missing for `<value>`" rather than improvising.

#### Scenario: Descriptor with all slots populated
- **WHEN** a planner invokes the skill with descriptor `{ http: express, rpc: grpc-js, orm: drizzle, queue: kafka, validator: zod }`
- **THEN** the skill SHALL proceed with all five slots driving capability derivation per the table required by the "capability derivation" requirement below

#### Scenario: Descriptor with only http slot populated
- **WHEN** a planner invokes the skill with descriptor `{ http: fastify }` (other slots absent or `none`)
- **THEN** the skill SHALL derive a foundation capability set containing only HTTP-flavor capabilities plus the always-present `test-scaffolding` capability, omitting `database`, queue, and rpc capabilities

#### Scenario: Unmapped descriptor slot value
- **WHEN** a planner provides `http: mercurius` (a value not in the closed list)
- **THEN** the skill SHALL direct the agent to STOP and surface a must-ask "descriptor slot `http` value `mercurius` is not in the closed list — extend the list or use a documented value"

### Requirement: The skill SHALL include a capability derivation table

`SKILL.md` MUST include a table that maps each populated descriptor slot value to one or more entries in the foundation capability list. The table SHALL be the authoritative mapping; if a foundation proposal's capability set differs from the table's output, the proposal MUST explicitly justify the deviation in its `## Decisions made without consultation` section.

The table SHALL include at minimum (final wording at the skill body's discretion):

- `http: express|fastify|koa|hapi` → `bootstrap`, `config`, `logger`, `validation`, `exception-filter`, `<smoke>-controller`
- `http: apollo-server` → above + `graphql-module`
- `rpc: grpc-js|mali` → `grpc-server`, `grpc-exception-filter`, `<smoke>-rpc-controller`
- `orm: drizzle|typeorm|prisma|knex` → `database`
- `queue: kafka|sqs|rabbitmq` → `<queue>-module` (subscribers wired in a follow-up change, not the foundation)
- `validator: zod` → folded into the `validation` capability above
- `validator: class-validator|joi` → `validation` capability uses the corresponding adapter
- Fixed tail: `test-scaffolding` (always present; opened as the final PR)

#### Scenario: Foundation capability set derived from descriptor
- **WHEN** a planner provides `{ http: express, validator: zod, orm: drizzle }`
- **THEN** the skill SHALL produce a foundation capability set of `bootstrap`, `config`, `logger`, `validation`, `exception-filter`, `<smoke>-controller`, `database`, `test-scaffolding` (eight capabilities)

#### Scenario: Foundation capability set documents deviation from the table
- **WHEN** a planner overrides the derivation table (for example, omitting `validation` because the service has no untrusted input boundary)
- **THEN** the proposal the skill produces SHALL include a `## Decisions made without consultation` entry naming the omitted capability and the rationale

### Requirement: The skill SHALL prescribe a Step 0 sibling-source-layout inspection

`SKILL.md` MUST direct agents to perform a second Step 0 inspection — alongside the existing file-diff inspection — covering source-convention items the migrating service must mirror from the sibling reference NestJS service. The inspection SHALL be documented in a new recipe at `skills/migrate-to-nestjs/recipes/sibling-source-layout-checklist.md`.

The recipe MUST cover:

- `src/` directory layout shape — whether the sibling splits into `common/`, `infra/`, `features/<name>/`, `config/`, `repositories/`, `dags/`, or a flatter shape
- Configuration module shape — singleton vs Nest DI provider; zod-validated vs plain TypeScript interface; file-loader location and signature; env-overlay convention
- Logger module shape — `forRoot` vs `forRootAsync`; whether log fields are decorated centrally or per call site
- Exception filter shape — platform-agnostic via `HttpAdapterHost` vs platform-specific imports
- Test layout — colocated `*.spec.ts` next to source vs separate `test/` tree mirroring `src/`
- Test infrastructure placement — under `src/test/*` with a `tsconfig.json` `paths` alias (NestJS-idiomatic) vs root-level `test/`
- Naming conventions — PascalCase vs kebab-case file names; suffix patterns (`*.module.ts`, `*.controller.ts`, `*.domain.ts`, etc.)

The output of the source-layout inspection SHALL be a single markdown "convention manifest" document that the foundation PR consumes during code generation. The manifest is NOT a commit (unlike the file-diff inspection's reconciliation commit) — it is a planning artifact attached to the proposal.

The new recipe MUST link to `sibling-file-diff-checklist.md` in its preamble, and `sibling-file-diff-checklist.md` SHALL be updated to link back, with a one-line distinction between the two checklists' outputs.

#### Scenario: Sibling reference uses common/infra/features layout
- **WHEN** a sibling NestJS service uses `src/common/`, `src/infra/`, `src/features/<name>/` and the migrating service has a flat `src/` with controllers and domains at the top level
- **THEN** the recipe SHALL direct the agent to record the sibling's three-folder split in the convention manifest and mirror it in the foundation rather than producing a flat layout

#### Scenario: Sibling reference uses colocated specs
- **WHEN** a sibling NestJS service places `*.spec.ts` next to source files and the migrating service has a separate `test/` tree
- **THEN** the recipe SHALL direct the agent to use colocated specs in the foundation, NOT to preserve the legacy `test/` tree

### Requirement: The skill SHALL treat the sibling reference codebase as optional, with a retrofit-risk warning when absent

`SKILL.md` MUST treat the sibling reference NestJS service as an OPTIONAL input. The skill's `Inputs` section MUST include a `referenceCodebase` field whose value is an absolute filesystem path to a sibling NestJS service, OR is omitted. The field MUST NOT be made required: not every consuming team has a NestJS reference service to point at, and gating adoption on a sibling would block teams whose adoption is fresh.

When the field is omitted, the agent MUST emit the following verbatim warning in the proposal it drafts:

> No sibling NestJS reference was provided. The skill is proceeding with NestJS documentation defaults. Known risk: docs-idiomatic output may diverge from your codebase conventions; expect 1–3 retrofit cycles per service post-foundation.

The warning informs the team of the tradeoff but SHALL NOT block the migration.

When the field is omitted, the source-layout checklist's inspection step SHALL be downgraded to "use NestJS documentation defaults" — the convention manifest still exists but records defaults rather than sibling-derived choices. The file-diff checklist continues to run against a `nest new` baseline.

#### Scenario: Sibling reference provided
- **WHEN** the planner supplies a path like `/abs/path/to/sibling-nestjs-service`
- **THEN** the skill SHALL run both Step 0 inspections (file-diff + source-layout) against the path and SHALL NOT emit the retrofit-risk warning

#### Scenario: Sibling reference omitted
- **WHEN** the planner omits the `referenceCodebase` field
- **THEN** the skill SHALL proceed using NestJS documentation defaults AND insert the verbatim retrofit-risk warning above into the proposal AND record the convention manifest entries as "default per NestJS docs" rather than "per sibling at `<path>`"

#### Scenario: Sibling reference must not be required
- **WHEN** a planner reads the skill's `Inputs` section
- **THEN** the `referenceCodebase` field SHALL be documented as optional, NOT required-by-default, and SHALL NOT carry a gate that prevents the skill from running when absent

### Requirement: The skill SHALL invoke the `ut-standards` skill at migration planning time

`SKILL.md` MUST direct the agent to INVOKE the sibling skill `ut-standards` (via the `Skill` tool, or the host runtime's equivalent skill-loading mechanism) at a specific step in its procedure — BEFORE authoring spec-level requirements for any HTTP-flavor, RPC-flavor, or persistence-flavor capability. The invocation loads the deploying organization's authoritative rule bodies into the agent's context so subsequent capability specs and implementation tasks can cite specific rule names by stable identifier (e.g. `error-shape`, `audience-prefix`).

`SKILL.md` MUST additionally include a `## Standards cross-reference` section that defers to `ut-standards` for the rule bodies. The section SHALL NOT duplicate the rule bodies; it SHALL list the specific rule names (from `ut-standards`) that apply to NestJS migrations, with one-line notes on how each rule is honored in the produced migration. The cross-reference exists alongside the invocation so a reader of `migrate-to-nestjs/SKILL.md` alone can see the rule scope without running the skill.

The rule names that apply to NestJS HTTP-flavor migrations (when the descriptor's `http` slot is populated with anything other than `none`) SHALL include:

- `audience-prefix` — URIs prefixed `/app|/admin|/api|/internal` per audience category. The skill MUST direct the agent to ASK the user which audience category applies if not stated.
- `uri-versioning` — `/v<n>/` segment.
- `error-shape` — global exception filter produces `{ error: { code, message, target } }`.
- `idempotency-key` — POST creation endpoints accept and dedupe by `Idempotency-Key` header.
- `x-request-id` — request ID propagated and logged.
- `iso-standards` — timestamps, currency, language, country in their respective ISO formats.
- `uuid-v4-ids` — all resource identifiers are UUID v4.
- `pagination-shape` — `{ items[], meta: { total, limit, offset } }` for list endpoints.
- `action-sub-resources` — `POST /<resource>/{uuid}/<actionVerb>` for non-CRUD operations.
- `monitoring-endpoint` — `GET /<resourceType>/{id}/monitor` where applicable.
- `openapi-spec` — OpenAPI 3.x versioned alongside the URI version.

The TARGET language for any migration is TS/Node per `ut-standards`' `typescript-node-is-adopt-general-purpose` rule. The SOURCE language is unconstrained — the skill accepts migrations from any source language and framework (Rails, Django, Spring, Sinatra, Go, etc.) when the team's strategy is to consolidate onto TS/Node + NestJS.

The invocation and cross-reference SHALL be portable: an external consumer (outside UserTesting) can replace `ut-standards` with their organization's equivalent standards skill, and both the invocation step and the rule-name references in `migrate-to-nestjs/SKILL.md` will continue to resolve provided the substitute skill uses the same rule-name vocabulary.

#### Scenario: Standards skill invoked before HTTP capability specs are authored
- **WHEN** the migration planning flow reaches the step where HTTP-flavor capability specs are to be authored
- **THEN** the skill SHALL invoke `ut-standards` first (loading its rule bodies into context) and SHALL NOT proceed to spec authoring until the invocation completes

#### Scenario: Invocation host runtime does not support sub-skill invocation
- **WHEN** the host runtime (e.g. an editor or CLI tool) does not expose a Skill-invocation primitive
- **THEN** the skill SHALL fall back to instructing the agent to READ `skills/ut-standards/SKILL.md` end-to-end at the same step, and the cross-reference section SHALL note the fallback path

#### Scenario: HTTP-flavor migration with audience category specified
- **WHEN** the descriptor has `http: express` and the planner specifies audience category `app`
- **THEN** the skill SHALL direct the agent to expose URIs under `/app/v1/...` in the new NestJS service, citing the `audience-prefix` rule in `ut-standards`

#### Scenario: HTTP-flavor migration without audience category
- **WHEN** the descriptor has `http: <anything-non-none>` and audience category is not specified
- **THEN** the skill SHALL surface a must-ask "Which audience category applies (app, admin, api, internal)?" before proceeding

#### Scenario: List endpoint pagination shape
- **WHEN** the agent implements a list endpoint in an HTTP-flavor migration
- **THEN** the response shape SHALL match the `pagination-shape` rule in `ut-standards` (`{ items, meta: { total, limit, offset } }`), NOT a bare array or alternative envelope

#### Scenario: Cross-reference does not duplicate rule bodies
- **WHEN** a reader compares the `## Standards cross-reference` section in `migrate-to-nestjs/SKILL.md` against the corresponding sections in `ut-standards/SKILL.md`
- **THEN** the `migrate-to-nestjs` section SHALL contain rule names and one-line "how it applies" notes only; the full rule bodies SHALL live exclusively in `ut-standards`

### Requirement: The skill SHALL define new must-ask classes for source-stack-aware migrations

In addition to the must-ask classes already defined for NestJS migrations, `SKILL.md` MUST list the following must-ask classes:

- **Descriptor slot value not in the closed list** — an unmapped value is given for `http`, `rpc`, `orm`, `queue`, or `validator`.
- **Audience category absent for HTTP-flavor migration** — the descriptor has `http: <non-none>` but the audience prefix (`app|admin|api|internal`) is not declared.
- **Error shape conflict between sibling and the deploying organization's standard** — the sibling reference's exception filter emits an error shape that differs from the deploying organization's REST API standard.
- **Sibling reference layout cannot be expressed by the source-layout recipe** — the sibling uses a layout that doesn't fit the recipe's enumerated categories (for example, a hexagonal-architecture split with `ports/` and `adapters/`).

#### Scenario: Sibling error shape differs from organization standard
- **WHEN** the sibling reference returns `{ reason, errorCode? }` but the organization's REST API standard prescribes `{ error: { code, message, target } }`
- **THEN** the agent SHALL stop and ask which shape is authoritative for this migration; if no override is provided, the skill SHALL direct the agent to follow the organization's standard

### Requirement: The skill's "When to use" framework list SHALL cover the full HOLD set from the deploying organization's framework radar

`SKILL.md`'s `When to use` section MUST name each legacy framework on the deploying organization's HOLD list as an in-scope source. For UserTesting, this list (per the Framework standardization page) SHALL include:

- Express
- hapi
- Mali (gRPC)
- hand-rolled `@grpc/grpc-js` (grpcServer)
- ApolloServer (GraphQL)

The skill SHALL assert that the TARGET language is TypeScript on Node.js, per the deploying organization's Languages choice standardization page (UserTesting: TypeScript/Node.js is ADOPT general-purpose). The SOURCE language SHALL NOT be constrained — the skill accepts migrations from any source language and framework when the team's strategy is to consolidate onto TS/Node + NestJS.

#### Scenario: Migration from hapi service
- **WHEN** a planner invokes the skill with a service whose HTTP framework is hapi
- **THEN** the skill SHALL accept the migration as in-scope and derive capabilities from `http: hapi`

#### Scenario: Migration from non-Node source
- **WHEN** a planner invokes the skill on a service written in Python, Go, Ruby, Java, Kotlin, or any other non-Node-TS language
- **THEN** the skill SHALL accept the migration as in-scope; the TS/Node-specific inspection steps (Step 0a sibling-file diff, Step 0b sibling source-layout) SHALL be SKIPPED; the foundation PR SHALL use NestJS documentation defaults for tooling. The remaining procedure (`Step 0.5` standards invocation, capability derivation, foundation shape, build gate, AppModule order, stacked-PR mechanics) SHALL apply identically.

#### Scenario: Source-stack descriptor with `other` value
- **WHEN** a planner annotates a slot value as `other` for a non-Node framework (e.g. `http: other  # Rails 7 ActionController`)
- **THEN** the skill SHALL accept the value, use the slot's presence (not its value) to drive capability derivation, and SHALL NOT surface an unmapped-slot must-ask


## Context

The `migrate-to-nestjs` skill (at `skills/migrate-to-nestjs/SKILL.md`, plus two recipes under `recipes/`) was graduated from a single project-specific migration (RAD-75634, `enriched-video-uploads-v2`) into a repo-agnostic shape. Two gaps surfaced after the first round of agnostic refactoring:

- The skill names Express + `@grpc/grpc-js` as the only legacy sources. The UT framework radar (Confluence, Oct 2025) now lists Nest.js as ADOPT and **Express, hapi, Mali, grpcServer (hand-rolled `@grpc/grpc-js`), and ApolloServer** as HOLD with Nest migration encouraged. The skill needs to cover the full HOLD set.
- The Step-0 sibling inspection covers config-tooling files (Prettier, ESLint, tsconfig, jest, Dockerfile, CI, package.json scripts) but does NOT cover source conventions (`src/` layout, config module shape, logger module shape, exception filter shape, test layout, test infra placement, naming conventions). Three retrofits landed on the reference migration AFTER the foundation merged — all source-layout drifts a deeper inspection would have caught. The dropped items existed in the original 409-line UT-specific skill body; they were lost in the agnostic refactor.

Additionally, the UT REST API Standard (Confluence) prescribes a specific HTTP error response shape (`{ error: { code, message, target } }`), an audience prefix scheme (`/app|/admin|/api|/internal`), URI versioning (`/v1/`), `Idempotency-Key` header semantics, `X-Request-ID` tracing, pagination conventions, action sub-resource conventions, a monitoring endpoint pattern, and an OpenAPI 3.x requirement. These are org-normative and supersede per-service conventions; the skill must cross-reference them and replace its current "documented schema" error-shape guidance.

Empirical evidence for the retrofit cost: on the reference migration's BFF foundation, the config layer initially shipped at 221 lines / 5 files following NestJS-docs idioms; after pointing at the sibling reference it was retrofit to 37 lines / 2 files. The 184-line delta is the cost of "agnostic by name only" — the skill produced framework-textbook output rather than codebase-idiomatic output because the sibling-source-layout inspection was missing.

## Goals / Non-Goals

**Goals:**

- Make the skill's source-stack coverage explicit and structured: a small descriptor instead of prose, a derivation table that maps descriptor slots to a foundation capability set.
- Move the sibling reference from "optional / recommended" to "required-by-default; explicit fallback warning when absent."
- Extend Step-0 inspection to source conventions (the items lost in the agnostic refactor) via a parallel recipe `sibling-source-layout-checklist.md`.
- Cross-reference the three UT Confluence standards pages as authoritative; encode their concrete must-honor rules for HTTP-flavor migrations inline in `SKILL.md`.
- Replace the project-specific "documented schema" error-shape guidance with the UT REST API Standard's `{ error: { code, message, target } }` shape.
- Keep the existing two recipes (`sibling-file-diff-checklist.md`, `rebase-stacked-squash.md`) unchanged in this PR; the new recipe is additive.

**Non-Goals:**

- Re-deriving the full 409-line UT-specific skill body. The agnostic skill is the canonical version; only the source-layout items + standards cross-references are being brought back.
- Rewriting `service-config-drift` or its auditors. The skill stays standalone and continues to cover prettier/Dockerfile/CI-fmt independently.
- Touching `enriched-video-uploads-v2` or any other consumer repo. This change is doc/skill-only in this repo.
- Adding new capabilities to the OpenSpec workflow itself (no `templates/opsx/` changes).
- Modeling source stacks outside the Node TS scope (Python, Go, etc.) — those are not migration targets for NestJS by the Languages standardization page.

## Decisions

**1. Source-stack descriptor schema is a fixed shape, not free-form.**

```yaml
sourceStack:
  http: express | fastify | koa | hapi | apollo-server | none
  rpc: grpc-js | mali | none
  orm: drizzle | typeorm | prisma | knex | none
  queue: kafka | sqs | rabbitmq | none
  validator: zod | class-validator | joi | none
```

Each slot is optional. `http` + `rpc` cover the transport surface; `orm` + `queue` + `validator` cover the supporting infrastructure. The slot list is closed (no `other`) to force the planner to either map to one of the named values or stop and surface a missing slot as a must-ask.

Alternative — free-form prose descriptions — rejected because the whole point of the refinement is to remove agent-judgment slicing. A closed shape forces the descriptor → capability mapping table to be authoritative.

**2. Capability derivation table is presented as a lookup, not a rule.**

The table maps each populated descriptor slot to one or more entries in the foundation capability list. Example (illustrative, final wording in spec):

| Descriptor slot | Adds to foundation capabilities |
|---|---|
| `http: express\|fastify\|koa\|hapi` | `bootstrap`, `config`, `logger`, `validation`, `exception-filter`, `<smoke>-controller` |
| `http: apollo-server` | (above) + `graphql-module` |
| `rpc: grpc-js\|mali` | `grpc-server`, `grpc-exception-filter`, `<smoke>-rpc-controller` |
| `orm: drizzle\|typeorm\|prisma\|knex` | `database` |
| `queue: kafka\|sqs\|rabbitmq` | `<queue>-module` (subscribers wired in a follow-up change, not the foundation) |
| `validator: zod` | included by `validation` capability above |
| `validator: class-validator\|joi` | `validation` capability uses `class-validator` or `joi` adapter |

Plus a fixed "always present" tail: `test-scaffolding` (final PR).

Alternative — derive the capability list inside the skill prose — rejected because tables are auditable and the proposal-mode artifact can copy the resolved capability list straight into the foundation proposal it generates.

**3. Sibling reference is optional, with an explicit retrofit-risk warning when absent.**

The skill's `Inputs` section gets an optional `referenceCodebase` field — an absolute path to a sibling NestJS service. The field is NOT required, because not every team has a "proper" NestJS reference service to point at; gating adoption on a sibling would block teams new to the framework.

When the field is omitted, the agent MUST emit this verbatim warning in the proposal it drafts:

> No sibling NestJS reference was provided. The skill is proceeding with NestJS documentation defaults. Known risk: docs-idiomatic output may diverge from your codebase conventions; expect 1–3 retrofit cycles per service post-foundation (empirical: ~184 lines of code retrofitted on the reference migration's BFF foundation alone).

The warning informs the team of the tradeoff but does NOT block the migration. The source-layout checklist's inspection step is skipped (or downgraded to a "use NestJS docs defaults" pass) when no sibling is supplied; the file-diff checklist still runs against the empty/`nest new` baseline.

Alternative — require a sibling by default with the fallback as an exception path — rejected because cross-team consumers of the skill may legitimately have no candidate sibling, and a required-by-default gate would push them toward synthetic references that defeat the inspection's purpose. The warning is the right pressure mechanism; the gate is not.

**4. The new recipe is a separate file, not appended to `sibling-file-diff-checklist.md`.**

`sibling-file-diff-checklist.md` covers config-tooling files. `sibling-source-layout-checklist.md` covers source conventions. Both are referenced from Step-0 of `SKILL.md`. They are kept separate because:

- Tooling reconciliation produces an immediate single-commit output (the reconciliation commit before any NestJS source lands).
- Source-layout reconciliation produces a "convention manifest" markdown document the foundation PR consumes during code generation — not a commit.
- Mixing them obscures which output each checklist produces.

Alternative — single combined checklist — rejected for the reasons above.

**5. UT standards live in a dedicated sibling skill (`skills/ut-standards/`), not inlined into `migrate-to-nestjs/SKILL.md`.**

The three Confluence pages are org-normative ("UT convention is king") and reusable across multiple future skills (code review, scaffolding, audit). Inlining their rules into `migrate-to-nestjs/SKILL.md` would (a) couple every future consumer to that skill's structure and (b) produce duplication the moment a second skill needs the same rules. A dedicated skill `ut-standards` solves both:

- **File layout**: `skills/ut-standards/SKILL.md` is the entry point. The body is organized one section per Confluence page (Framework / REST API / Languages) with each page's must-honor rules as discrete WHEN/THEN scenarios. Each rule is named (e.g. `audience-prefix`, `error-shape`, `idempotency-key`, `iso-timestamps`) so consumers can reference specific rules by name.
- **Frontmatter**: matches the convention in the skills README (`name`, `description`, `license: MIT`, `compatibility`, `metadata.author`, `metadata.version`). Compatibility note: "UserTesting-specific; consumers outside UT should fork or replace with their own org's standards."
- **Repo-agnostic self-check section**: the standard skill preamble explicitly states this skill is UT-specific and lists the substitution surface (the three Confluence URLs + UT-specific resource names) for external consumers.
- **Graduation criteria**: graduates out of this repo when (a) UT moves the canonical standards into a versioned reference the skill can fetch programmatically, OR (b) a second organization mirrors the pattern (a `corp-standards` skill), at which point the shape becomes a reusable template.
- **How `migrate-to-nestjs` consumes it**: a short `## Standards cross-reference` section in `migrate-to-nestjs/SKILL.md` links to `skills/ut-standards/SKILL.md` and names the specific rules that apply to NestJS HTTP-flavor migrations (rule names: `audience-prefix`, `uri-versioning`, `error-shape`, `idempotency-key`, `x-request-id`, `iso-standards`, `uuid-v4-ids`, `pagination-shape`, `action-sub-resources`, `monitoring-endpoint`, `openapi-spec`). It does NOT duplicate the rule bodies.

Alternative — inline all UT rules into `migrate-to-nestjs/SKILL.md` (the original plan) — rejected because the user signaled UT convention is org-normative and worth elevating; inline duplication blocks future reuse and forces every consuming skill to redocument.

Alternative — a shared reference file under `skills/_shared/` (no SKILL.md) — rejected because the skills README mandates "Every subdirectory under `skills/` follows the same shape: SKILL.md as entry point." A standards body without a SKILL.md violates that convention; promoting it to a full skill keeps the convention intact and gives the standards body its own graduation track.

Alternative — encoding the rules as `openspec/config.yaml` rules — rejected for the reasons documented in the user-facing tradeoff (rules in `config.yaml` are per-artifact and repo-wide; they over-apply to changes that don't need them, and hardcoding UT URLs at the config layer couples the entire repo to one org).

**6. The error-shape replacement is a BREAKING change.**

The current `SKILL.md` text says "align with the documented schema in `src/schemas/error-response.schema.ts`, not the runtime behavior, when they conflict." The UT REST API Standard's normative shape is `{ error: { code, message, target } }`. The replacement is breaking for any consumer that took the previous guidance literally on a project-specific schema. Search of this repo for the prior wording finds zero internal cross-references; the breakage is bounded to consumers of the published skill.

Alternative — keep both, mark the documented-schema guidance as deprecated — rejected because the two shapes are mutually exclusive; carrying both perpetuates the inconsistency the standards page is intended to resolve.

**7. The local `~/.claude/skills/migrate-to-nestjs/` sync is a follow-up, not part of this PR.**

The user's local skill directory is out-of-tree (the canonical home is this repo's `skills/`). Syncing the local copy ensures Claude Code sessions load the new content, but the sync mechanics depend on the user's home-directory layout and aren't part of this repo's deliverable. Task tracked separately in the orchestrating session.

Alternative — script the sync inline in this PR — rejected because the script would live in this repo but operate on `~/.claude/`, mixing concerns.

## Risks / Trade-offs

- **[Risk]** Closed descriptor slot list misses a real-world stack (e.g. a service on TRPC, Mercurius, or BullMQ).
  **→ Mitigation:** the skill must direct the agent to STOP and surface a "descriptor slot missing for `<value>`" must-ask when it encounters an unmapped value. The closed list trades coverage for clarity; the must-ask is the escape hatch.

- **[Risk]** The capability derivation table over-specifies for a service that doesn't follow the typical wiring (e.g. an HTTP service with no validator, or a service where `database` is multi-tenant and needs custom wiring beyond the canonical Drizzle module).
  **→ Mitigation:** the table is a default mapping; the skill's "Decisions made without consultation" contract requires the agent to record any deviation in the foundation proposal it drafts. The table is auditable, not load-bearing.

- **[Risk]** The new source-layout recipe may diverge from `sibling-file-diff-checklist.md` over time, causing reviewers to consult the wrong recipe.
  **→ Mitigation:** the two recipes link to each other in their preamble ("see also") and the `SKILL.md` Step-0 section names both with a one-line distinction.

- **[Trade-off]** Required-by-default sibling shifts effort to the planner (they must locate a sibling before invoking the skill). This is the intended cost — the reference migration's retrofit cycles were paid in implementation time; the new policy pays the cost in planning time, which is cheaper.

- **[Trade-off]** Cross-referencing UT-specific Confluence URLs in a repo-agnostic skill couples the skill to UT's standards site. The repo-agnostic framing is preserved by phrasing the rules as "the deploying org's REST API standard (UT example: …)" rather than "UT mandates …". An external consumer can substitute their own standards page; the rules referenced (audience prefix, error shape, etc.) are conventional industry patterns.

## Migration Plan

1. Land this PR in this repo against `main`.
2. After merge, the user runs `/opsx:archive refine-migrate-to-nestjs-skill` (and the post-archive hook fires `/opsx:summarize` automatically per `openspec/config.yaml`).
3. Follow-up (outside this PR, tracked in orchestrator session): sync `~/.claude/skills/migrate-to-nestjs/` to match this repo's `skills/migrate-to-nestjs/`. This is a `cp -r` plus a sanity-check that the local recipes folder is in sync.

Rollback: the change is additive to `SKILL.md` (one new section, one updated section) plus one new recipe file, plus spec updates. Revert is a single `git revert <merge-commit>` with no downstream side effects.

## Delivery shape

- **PR shape:** one PR.
- **Base branch:** `main` (default branch of this repo).
- **Repo merge-method:** the repo allows squash, merge, and rebase. This PR will use **squash** because it is a single-PR doc change with no stack to preserve history for. No rebase recipe is needed; `recipes/rebase-stacked-squash.md` does not apply.
- **Named `/opsx:*` skill invocations:**
  - propose-end: this `/opsx:propose` invocation produces the four artifacts (proposal, design, specs, tasks).
  - capability-start: not applicable — single capability, no per-capability boundaries.
  - capability-end: `/opsx:apply refine-migrate-to-nestjs-skill` writes the SKILL.md additions, the new recipe, and the spec updates.
  - PR open: `/opsx:pr` against `main` with `@cursor` reviewer per `openspec/config.yaml` `agents.pr-reviewers`.
  - archive: `/opsx:archive refine-migrate-to-nestjs-skill` after the PR merges; the post-archive hook fires `/opsx:summarize` automatically.

## Open Questions

- Should the source-stack descriptor be encoded in YAML inside the foundation proposal that the skill generates, or kept as inline prose in the proposal? Default in this design: the skill's `Inputs` section documents the descriptor schema; the foundation proposal copies the resolved values inline as a fenced YAML block. Open to revisiting if the proposal template grows a `## Source stack` section in a later iteration.

- The `service-config-drift` skill could host the new source-layout checklist as a fourth auditor (`source-layout-vs-sibling`), making it independently invokable outside a migration context. Deferred — the auditor framing requires a pass/fail/skipped result, but a source-layout check is comparative (vs a sibling), not a single-repo audit. Revisit if `service-config-drift` graduates to a more general "repo hygiene vs reference" skill.

## Decisions made without consultation

- **Squash merge-method for this PR.** Alternative — merge commit, to preserve the per-artifact commit history of the propose flow — rejected because this repo's prior `RAD-75634` archive PRs all used squash and the repo lacks a stated preference for merge commits; aligning with prior practice is cheaper than introducing variance.
- **Capability derivation table values for `apollo-server` and `mali`.** No prior UserTesting NestJS migration has covered ApolloServer or Mali sources, so the table values are inferred from each library's surface (Apollo → GraphQL module; Mali → NestJS microservices gRPC transport with the legacy Mali handler shape mapped to `@MessagePattern` handlers). Alternative — defer ApolloServer and Mali coverage to a follow-up change — rejected because the UT framework radar explicitly names both as HOLD candidates for migration, and the descriptor is closed; not naming them now would force a must-ask on the first real migration from either source.

Starting state: brownfield
Cutover: greenfield

## Why

The `migrate-to-nestjs` skill graduated to a repo-agnostic shape after the first NestJS migration (RAD-75634), but two gaps have become visible since:

1. **The skill is "agnostic in name only" for the source stack.** The "When to use" clause still names Express and `@grpc/grpc-js` specifically, and capability slicing is left to agent judgment. The UserTesting framework radar has since shipped (Oct 2025) declaring Nest.js the ADOPT preferred backend Node framework and placing **hapi, Mali, Express, grpcServer (hand-rolled @grpc/grpc-js), and ApolloServer** on HOLD with explicit Nest.js migration encouraged — the skill should cover all five legacy frameworks, not the two it was originally derived from.
2. **Step-0 sibling inspection covers config files but not source conventions.** Three post-archive retrofits on the reference migration (`enriched-video-uploads-v2`, branches `migrate-bff-foundation` + `migrate-service-foundation`) — config simplification (221 → 37 lines), `common/`+`infra/`+`config/` split, and spec colocation under `src/<feature>/` — were source-layout drifts a sibling-source-layout inspection would have caught up front. The current `sibling-file-diff-checklist.md` recipe covers Prettier, ESLint, tsconfig, jest, Dockerfile, CI, and `package.json` scripts. It does NOT cover `src/` layout, config module shape, logger module shape, exception filter shape, test layout, or naming conventions. That gap produced ~3 retrofit cycles per service on the reference migration.

Additionally, three UT architecture-standards Confluence pages have shipped that the skill must reference as authoritative when driving HTTP-flavor migrations (BFFs in particular). One of those pages (UT REST API Standard) prescribes an error response shape `{ "error": { "code", "message", "target" } }` that **directly supersedes** the skill's current "error shape from documented schema, not runtime" guidance.

## What Changes

- **Add a structured source-stack descriptor** to the skill's `Inputs` section: `{ http?: express|fastify|koa|hapi|apollo-server|none, rpc?: grpc-js|mali|none, orm?: drizzle|typeorm|prisma|knex|none, queue?: kafka|sqs|rabbitmq|none, validator?: zod|class-validator|joi|none }`. A descriptor-to-foundation-capability derivation table maps populated slots to the foundation capability set, replacing prose-judgment slicing.
- **Add `recipes/sibling-source-layout-checklist.md`** — parallels `sibling-file-diff-checklist.md` but covers `src/` layout (common/infra/features split shape), config module shape, logger module shape, exception filter shape, test layout (colocated vs separate tree), test infra placement, and naming conventions. Output: a single "convention manifest" the foundation PR consumes.
- **Expand the legacy-framework scope** in the skill's `When to use` clause to: Express, hapi, Mali, hand-rolled `@grpc/grpc-js` (grpcServer), and ApolloServer — aligned with the UT framework radar.
- **Add a new sibling skill `ut-standards`** at `skills/ut-standards/SKILL.md` that encodes the three UserTesting architecture-standards Confluence pages (Framework standardization, UT REST API Standard, Languages choice standardization) as a single authoritative reference. The skill enumerates each page's must-honor rules with WHEN/THEN normativeness so consumers (initially `migrate-to-nestjs`, future scaffolding/migration skills, code review automation) can defer to it rather than redocumenting the rules per-skill. `migrate-to-nestjs` consumes it via a short `## UT standards cross-reference` section that links to the new skill rather than inlining the rules.
- **BREAKING** Replace the skill's current "Error shape from documented schema, not runtime" guidance with the UT REST API Standard's `{ error: { code, message, target } }` shape. The current guidance was project-specific (UT's video-uploads schema is `{ reason, errorCode? }`); the new standard supersedes per-service schemas by org policy.
- **Keep the reference-codebase input optional, but require an explicit retrofit-risk warning when absent.** Not every team has a NestJS reference service to point at; mandating one would block adoption from teams new to the framework. When the planner declares no sibling reference, the skill SHALL direct the agent to emit a verbatim "no sibling available; expect 1–3 retrofit cycles per service post-foundation" warning in the proposal it drafts. The post-archive retrofits cited above (~184 lines on the BFF foundation alone) inform the warning text but do not gate the migration.
- **Update the living spec** at `openspec/specs/skill-migrate-to-nestjs/spec.md` with new requirements + scenarios covering each of the above.

## Capabilities

### New Capabilities

- `skill-ut-standards`: a new domain skill at `skills/ut-standards/SKILL.md` that encodes the three UserTesting architecture-standards Confluence pages (Framework standardization, UT REST API Standard, Languages choice standardization) as authoritative rules with WHEN/THEN scenarios. Lives in the current incubation host alongside other domain skills; invoked by `migrate-to-nestjs` (this change) and available for future skills (code review, scaffolding, audit). Carries its own graduation criteria. The skill body MUST be portable: no references to the host repo name.

### Modified Capabilities

- `skill-migrate-to-nestjs`: adds requirements for the source-stack descriptor + capability derivation table; the sibling-source-layout inspection (new recipe); **invocation of** the new `ut-standards` skill at migration planning time, plus a cross-reference section pointing at it (together they replace the inline UT rules originally planned); the expanded legacy-framework scope (hapi, Mali, ApolloServer added); the UT REST API Standard error shape (replaces the documented-schema guidance); and the optional-sibling-with-fallback-warning policy.

## Impact

- **Affected files**:
  - `skills/ut-standards/SKILL.md` — NEW; full body of the UT-standards skill (three pages' rules encoded as WHEN/THEN scenarios + graduation criteria).
  - `skills/migrate-to-nestjs/SKILL.md` — new subsections under Inputs (source-stack descriptor) and Procedure (capability derivation, reference-codebase policy), new top-level "UT standards cross-reference" section (LINKS to `skills/ut-standards/SKILL.md`, does not duplicate its content), expanded "When to use" framework list, error-shape guidance updated.
  - `skills/migrate-to-nestjs/recipes/sibling-source-layout-checklist.md` — new file.
  - `openspec/specs/skill-ut-standards/spec.md` — NEW capability spec.
  - `openspec/specs/skill-migrate-to-nestjs/spec.md` — new requirements + scenarios, including a requirement that points at `skill-ut-standards` rather than inlining the rules.
- **Consumers**: any agent or human invoking `/migrate-to-nestjs` (or reading the skill) on a future Node TS service migration. The local copy at `~/.claude/skills/migrate-to-nestjs/` is out-of-tree and will be synced after this change archives (tracked as follow-up, not part of this PR).
- **Breaking**: the error-shape change is breaking for any documentation cross-referencing the prior "documented schema" wording. Search of `the current incubation host` finds no such cross-references; the change is self-contained.
- **Out of scope**: no service repo changes; no Nest framework upgrade; no changes to the sibling `service-config-drift` skill (its three auditors continue to cover prettier/Dockerfile/CI-fmt independently).

## Non-code surfaces

- Config load mechanics: N/A — skill-documentation change; no service config loaded.
- Secret sources: N/A — no secrets handled.
- Container/deploy artifacts: N/A — skill-documentation change; not deployed.
- CI workflow scripts: N/A for this change. Note: the skill body itself references CI workflow expectations consumers must honor (lint/test/fmt/build), but this change does not modify any CI script in `the current incubation host`.
- Observability endpoints: N/A — no runtime observability.

## Decisions made without consultation

- **Change name** `refine-migrate-to-nestjs-skill` rather than `expand-...` or `align-migrate-to-nestjs-with-ut-standards`. Alternatives rejected because the work is broader than alignment (it adds new capability-derivation machinery and the source-layout checklist) and narrower than expansion (it does not introduce a new skill). "Refine" captures iterative skill maturation, matching the change's spirit.
- **Single PR shape (not stacked).** Alternative — stacked PRs per sub-change — rejected because the additions are small (one new recipe, one SKILL.md section, a handful of spec requirements) and naturally cohere; splitting would create review friction without benefit. The `## Delivery shape` section in `design.md` will record this.
- **Adopting the UT REST API Standard's `{ error: { code, message, target } }` shape as the new canonical error response.** Alternative — preserve the current "documented schema, not runtime" guidance, accepting per-service variance — rejected because the standards page is normative org policy and supersedes per-service documented schemas. Flagged as a may-decide rather than must-ask because the policy is explicit and the previous guidance was project-derived rather than standards-derived.

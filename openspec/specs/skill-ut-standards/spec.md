# skill-ut-standards Specification

## Purpose
TBD - created by archiving change refine-migrate-to-nestjs-skill. Update Purpose after archive.
## Requirements
### Requirement: `ut-standards` skill SHALL exist at `skills/ut-standards/SKILL.md`

A skill named `ut-standards` SHALL be present at `skills/ut-standards/SKILL.md`. It SHALL encode the three UserTesting architecture-standards Confluence pages as authoritative, citeable rules for consumption by other skills (initially `migrate-to-nestjs`; later candidates include code review, scaffolding, audit).

The skill's frontmatter SHALL follow the convention documented in `skills/README.md`:

```yaml
---
name: ut-standards
description: <one-sentence trigger description>
license: MIT
compatibility: UserTesting-specific; consumers outside UT should fork or replace with their own organization's standards skill.
metadata:
  author: insight-out
  version: "1.0"
---
```

The skill body SHALL NOT name the hosting repository. The skill SHALL refer to its current home as "this incubation repo" or "the host repo" when context demands; it SHALL NOT hard-code the repo name in SKILL.md, recipes, or auditors. The skill MUST stay portable so it travels intact when graduated to a new home (e.g. a versioned package, a UT-internal repo, or a graduated location selected by maintainers).

The skill SHALL include a self-check section at the top noting that this skill is UT-specific by design and listing the substitution surface for external consumers (the three Confluence URLs and UT-specific resource names).

#### Scenario: SKILL.md contains no hard-coded host-repo name
- **WHEN** a maintainer greps the published `skills/ut-standards/SKILL.md` body and recipes for the name of the current host repository
- **THEN** no occurrence SHALL be found; the skill SHALL use portable references ("this incubation repo", "the host repo", or no reference at all)

#### Scenario: Skill present after this change is applied
- **WHEN** this change is archived
- **THEN** `skills/ut-standards/SKILL.md` SHALL exist with the required frontmatter and self-check section

### Requirement: The skill SHALL encode the Framework standardization page

`SKILL.md` MUST include a section that names UserTesting's Framework Standardization page (Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4362305794/Framework+standardization`) and enumerates the framework radar status that affects migration and scaffolding decisions:

- **ADOPT**: Nest.js (backend Node.js services), React (frontend).
- **HOLD** (eligible for migration to Nest.js, no new projects): Express, hapi, Mali, grpcServer (hand-rolled `@grpc/grpc-js`), ApolloServer (GraphQL).
- **HOLD** (eligible for migration to React, no new projects): Angular.

The section SHALL name each rule (e.g. `nest-is-target-framework`, `legacy-source-is-on-hold`) so consuming skills can cite by name. Rule bodies SHALL use direct prose with examples — NOT WHEN/THEN scenarios (which are reserved for OpenSpec specs).

#### Scenario: Scaffolding decision references the framework radar
- **WHEN** a backend scaffolding skill needs to choose a framework for a new Node.js service
- **THEN** it SHALL cite the `nest-is-target-framework` rule from this section and use Nest.js

#### Scenario: Migration source-framework validation
- **WHEN** the `migrate-to-nestjs` skill validates that its source framework is in scope
- **THEN** it SHALL cite the `legacy-source-is-on-hold` rule and accept Express, hapi, Mali, grpcServer, or ApolloServer as in-scope sources

### Requirement: The skill SHALL encode the UT REST API Standard page

`SKILL.md` MUST include a section that names the UT REST API Standard page (Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4221698350/UT+REST+API+Standard`) and enumerates the must-honor rules below. Each rule SHALL be named so consuming skills can reference it precisely:

1. **`audience-prefix`** — internal URIs SHALL be prefixed with `/app|/admin|/api|/internal` per audience category. Gateway maps to audience-specific domains; the prefix is mandatory at the service layer.
2. **`uri-versioning`** — `/v<n>/` segment in URIs; no query-string or header versioning. Bump major version only for breaking changes.
3. **`error-shape`** — error responses SHALL be `{ "error": { "code": "<ShortCode>", "message": "<human readable>", "target": "<optionalFieldName>" } }`. Use short stable codes (`InvalidInput`, `ValidationFailed`, `ResourceNotFound`, etc.).
4. **`idempotency-key`** — POST endpoints that create resources SHALL accept an `Idempotency-Key` header (UUID v4) and return the same result for repeated requests with the same key.
5. **`x-request-id`** — services SHALL accept and propagate `X-Request-ID` for distributed tracing; structured log lines SHALL include the value.
6. **`iso-standards`** — timestamps in ISO 8601 UTC (`Z` suffix); currency in ISO 4217; language in ISO 639-1; country in ISO 3166-1 alpha-2.
7. **`uuid-v4-ids`** — all resource IDs in URIs and JSON payloads SHALL be UUID v4; no sequential or compound IDs.
8. **`pagination-shape`** — list endpoints SHALL return `{ "items": [...], "meta": { "total": <n>, "limit": <n>, "offset": <n> } }` with `limit` and `offset` query parameters.
9. **`action-sub-resources`** — non-CRUD operations SHALL be modeled as `POST /<resource>/{uuid}/<actionVerb>`, never as query parameters or top-level verb URIs.
10. **`monitoring-endpoint`** — when applicable, expose `GET /<resourceType>/{id}/monitor` returning the structured operational status payload prescribed by the standard.
11. **`openapi-spec`** — public and customer-facing APIs SHALL have an OpenAPI 3.x specification versioned alongside the URI version (e.g. `/v1/`).
12. **`required-resource-attributes`** — resource responses SHALL include `id` (UUID v4), `name`, `description`, `createdAt` (ISO 8601 UTC), `updatedAt` (ISO 8601 UTC).
13. **`summary-vs-detail-responses`** — list endpoints return summary objects; single-resource endpoints return full objects.
14. **`read-only-db-for-gets`** — all GET operations SHALL use read-only database instances to avoid unintentional writes or locks.
15. **`http-method-semantics`** — GET = safe + idempotent; POST = create only; PUT = full replacement; PATCH = partial update; DELETE = idempotent removal.
16. **`batch-query-pattern`** — multi-resource fetch via `POST /resource/query` with a body containing IDs or filters; never via GET with overlong query strings.
17. **`json-content-type`** — all requests and responses SHALL use `application/json`. JSON property names SHALL be camelCase. Top-level value SHALL be an object, not an array or primitive.

#### Scenario: HTTP migration cites error shape
- **WHEN** a NestJS HTTP migration's exception filter is implemented
- **THEN** it SHALL produce the `error-shape` payload `{ error: { code, message, target } }` exactly

#### Scenario: List endpoint cites pagination shape
- **WHEN** a NestJS HTTP migration implements a list endpoint
- **THEN** the response shape SHALL match the `pagination-shape` rule (`items[]` + `meta`)

#### Scenario: Action verb in URI rejected
- **WHEN** a consumer proposes a URI like `POST /tests/launchTest`
- **THEN** the skill SHALL reject the URI as violating `action-sub-resources` and direct the consumer to `POST /tests/{uuid}/launch` instead

### Requirement: The skill SHALL encode the Languages choice standardization page

`SKILL.md` MUST include a section that names the Languages Choice Standardization page (Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4244308285/Languages+choice+standardization`) and enumerates the language radar status:

- **ADOPT (general-purpose)**: TypeScript / Node.js.
- **ASSESS**: Go (performance-focused projects, case-by-case).
- **HOLD**: Ruby, Scala, Java, Clojure.
- **ADOPT (area-specific)**: Python (data/ML), Swift (iOS), Kotlin (Android).

Rule bodies SHALL use direct prose with examples — NOT WHEN/THEN scenarios.

#### Scenario: Backend scaffolding language choice
- **WHEN** a backend scaffolding skill chooses a language for a new general-purpose service
- **THEN** it SHALL cite the `typescript-node-is-adopt-general-purpose` rule and use TypeScript on Node.js

#### Scenario: Migration rejects non-TS source
- **WHEN** the `migrate-to-nestjs` skill is invoked on a Python or Go service
- **THEN** the skill SHALL refuse the migration as out-of-scope, citing the language standardization page

### Requirement: The skill SHALL be consumable by other skills via named-rule references

`SKILL.md` MUST be structured so a consuming skill can reference a specific rule by name (e.g. `audience-prefix`, `error-shape`, `idempotency-key`) without forcing the consumer to enumerate the rule's full content. Each rule SHALL have a stable identifier (the kebab-case name) and a canonical anchor (markdown heading) so links from other SKILL.md files resolve cleanly.

The skill SHALL NOT prescribe an implementation procedure (it is a reference body, not a runnable procedure). Procedures for applying the rules belong in consuming skills (e.g. `migrate-to-nestjs` describes how to wire the error shape into a NestJS global exception filter).

#### Scenario: `migrate-to-nestjs` links to a named rule
- **WHEN** `migrate-to-nestjs/SKILL.md`'s cross-reference section names the rules that apply to NestJS HTTP-flavor migrations
- **THEN** the reference SHALL use stable rule names (e.g. "see `error-shape` in `ut-standards`") and SHALL NOT duplicate the rule body

### Requirement: The skill SHALL declare graduation criteria

`SKILL.md` MUST include a `## Graduation` section listing the conditions under which the skill should move out of its current incubation home:

- UserTesting moves the canonical standards into a versioned reference the skill can fetch programmatically (the skill becomes a thin fetcher rather than a snapshot).
- A second organization mirrors the pattern with its own `<org>-standards` skill, at which point the shape becomes a reusable template (extract a `corp-standards-template` skill).
- The skill is consumed by three or more sibling skills, justifying a dedicated package.

#### Scenario: Graduation triggered
- **WHEN** any graduation condition is met
- **THEN** maintainers SHALL follow the procedure in `skills/README.md` (copy to new home, leave `MOVED.md` stub)


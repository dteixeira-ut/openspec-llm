---
name: ut-standards
description: Authoritative reference body encoding UserTesting's architecture-standards Confluence pages (Framework Standardization, REST API Standard, Languages Choice Standardization) as named, citeable rules. Invoked by other skills (e.g. migrate-to-nestjs) at planning time to load org-normative constraints.
license: MIT
compatibility: UserTesting-specific by design. Consumers outside UT should fork this skill or substitute their own organization's standards skill that uses the same rule-name vocabulary.
metadata:
  author: insight-out
  version: "1.1"
---

# `ut-standards`

This skill is a **reference body**, not a runnable procedure. Other skills invoke it at planning time to load UserTesting's architecture standards into the agent's context, then cite specific rules by stable name (e.g. `error-shape`, `audience-prefix`, `idempotency-key`).

## Self-check — UT-specific by design

Unlike most skills in this collection, this skill is **intentionally** organization-specific. It encodes three UserTesting Confluence pages as their canonical content snapshot. Consumers outside UserTesting MUST either:

- Fork this skill, replace the three Confluence URLs with their organization's equivalents, and substitute the rule bodies; OR
- Author a parallel `<org>-standards` skill that uses the same rule-name vocabulary so cross-references in consumer skills (e.g. `migrate-to-nestjs`) continue to resolve.

**Substitution surface** (the items external consumers MUST replace):

- The three Confluence URLs in the sections below.
- UT-specific resource names in examples (e.g. `tests`, `workspaces`, `audiences`, `sessions`).
- The `insight-out` author value in frontmatter.

**Portability invariant**: this skill body MUST NOT name the repository that currently hosts it. The skill stays portable so it travels intact when graduated to a new home.

## When to use this skill

Invoke this skill when a consuming skill needs to author code or specifications that must comply with UserTesting's architecture standards. The canonical consumer pattern is:

1. The consuming skill (e.g. `migrate-to-nestjs`) invokes `ut-standards` at a named step.
2. `ut-standards` loads its rule bodies into the agent's context.
3. The consuming skill cites specific rules by name (`error-shape`, `audience-prefix`, etc.) in subsequent generation.

Do NOT use this skill:

- As a runnable procedure — there are no implementation steps here. Procedures belong in consuming skills.
- For code samples — the rules are language-agnostic at the standards layer. NestJS-specific implementations live in `migrate-to-nestjs`; React-specific ones would live in their own consuming skill.

## How consumers reference these rules

Each rule below has:

- A **stable kebab-case name** (e.g. `error-shape`).
- A markdown heading that doubles as an anchor (e.g. `#### error-shape`).
- A short prose body stating the rule, followed by examples where useful.

Consuming skills reference rules by name in prose: *"see `error-shape` in `ut-standards`"*. They MUST NOT duplicate rule bodies; if a body must be quoted, the consuming skill links rather than copies.

---

## Framework Standardization

Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4362305794/Framework+standardization`

UserTesting's framework radar classifies frameworks as ADOPT / ASSESS / HOLD. This section encodes the current radar status (as of October 2025).

### Backend frameworks

#### `nest-is-target-framework`

Nest.js is ADOPT for new backend Node.js services. All new general-purpose backend services SHALL be built on Nest.js; existing legacy services SHALL target Nest.js when migrating.

#### `legacy-source-is-on-hold`

Express, hapi, Mali, grpcServer (hand-rolled `@grpc/grpc-js`), and ApolloServer are HOLD frameworks. No new projects in these frameworks; maintenance (bugfixes, dependency updates, small enhancements) is acceptable; migration to Nest.js is encouraged but not mandatory.

Existing services on a HOLD framework MAY receive bugfixes without triggering a migration. New project proposals targeting a HOLD framework SHALL be rejected — they must target Nest.js instead. When `migrate-to-nestjs` validates its source, all five HOLD frameworks are accepted as in-scope sources.

### Frontend frameworks

#### `react-is-target-frontend`

React is ADOPT for new frontend development. All new frontend features SHALL be built on React.

#### `angular-is-on-hold`

Angular is HOLD. Maintenance is acceptable; migration to React is encouraged but not mandatory. No new projects in Angular — new frontend proposals SHALL target React instead.

---

## REST API Standard

Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4221698350/UT+REST+API+Standard`

All UserTesting REST APIs SHALL honor the rules below. Each rule has a stable kebab-case name; consuming skills cite the rule name and trust the body here as canonical.

### URI and routing

#### `audience-prefix`

Internal service URIs MUST be prefixed with the audience category: `/app|/admin|/api|/internal`. The four categories:

- `app` — APIs used by the frontend (logged-in customers via browser/mobile).
- `admin` — privileged APIs for internal UT admin tools.
- `api` — public APIs for developers and integrations.
- `internal` — backend-only APIs for service-to-service communication.

The audience prefix is enforced at the service layer; the gateway maps it to audience-specific external domains (e.g. `app.usertesting.com`, `internal.usertesting.com`). URI segmentation alone does NOT enforce access control — authorization rules apply independently.

**Examples**:
- Frontend-facing API → `/app/v1/...`
- Service-to-service API → `/internal/v1/...`

#### `uri-versioning`

APIs MUST use URI versioning (`/v1/`, `/v2/`, …). Query-string and header versioning are NOT allowed. Bump the major version ONLY for breaking changes; additive changes (new optional fields, new endpoints) leave the version unchanged.

**Examples**:
- Adding an optional field → no version bump.
- Renaming or removing a field → bump (`/v1/` → `/v2/`).

#### `action-sub-resources`

Non-CRUD operations MUST be modeled as `POST /<resource>/{uuid}/<actionVerb>` sub-resources. Action verbs SHALL NOT appear as query parameters or as top-level URI segments.

**Examples**:
- ✓ `POST /app/v1/tests/{uuid}/launch`
- ✗ `POST /app/v1/launchTest`
- ✗ `GET /app/v1/tests/{uuid}?action=launch`

#### `monitoring-endpoint`

When operational monitoring is exposed at the resource level, the URI MUST be `GET /<resourceType>/{id}/monitor`, returning the structured operational status payload prescribed by the standard.

**Example**: `GET /app/v1/tests/{uuid}/monitor` → `{ testId, status, completes, lastUpdated, issues }`.

### HTTP methods

#### `http-method-semantics`

HTTP methods MUST be used per their canonical semantics:

- `GET` — safe and idempotent; reads only. Supports filtering, sorting, pagination via query params. Returns `200 OK` or `404 Not Found`.
- `POST` — resource creation only. Returns `201 Created` with a `Location` header (or `202 Accepted` for async). MUST NOT be used for update or delete.
- `PUT` — full resource replacement. Omitted fields are cleared. Returns `200 OK`, `204 No Content`, or `404 Not Found`.
- `PATCH` — partial update. Returns `200 OK`, `204 No Content`, or `404 Not Found`.
- `DELETE` — idempotent. Returns `204 No Content` if successful, or `404 Not Found`.

**Example**: rename a test (partial update) → `PATCH /app/v1/tests/{uuid}`, NOT `POST` or `PUT`.

#### `batch-query-pattern`

Multi-resource fetch MUST use `POST /<resource>/query` with a body of IDs or filters. Read operations only — never creation or update.

**Example**: `POST /internal/v1/tests/query` with body `{ "ids": ["..."] }` → `200 OK` with the matching items.

### Request and response shape

#### `json-content-type`

All requests and responses MUST use `application/json`. JSON property names MUST be camelCase. The top-level JSON value MUST be an object — never an array, never a primitive.

#### `pagination-shape`

List endpoints MUST return:

```json
{
  "items": [ /* summary objects */ ],
  "meta": { "total": <n>, "limit": <n>, "offset": <n> }
}
```

Query parameters: `limit` and `offset`. The `items` array contains summary objects (see `summary-vs-detail-responses`).

#### `summary-vs-detail-responses`

List endpoints return summary objects (minimal fields). Single-resource endpoints return full detail objects. Expensive attributes SHOULD be modeled as child resources to keep detail responses bounded.

**Examples**:
- `GET /app/v1/workspaces` → each item has `{ id, name, status }` (summary).
- `GET /app/v1/workspaces/{uuid}` → full object with `owner`, `settings`, `createdAt`, `updatedAt`, etc.

#### `required-resource-attributes`

Every resource response MUST include:

- `id` (UUID v4)
- `name`
- `description`
- `createdAt` (ISO 8601 UTC)
- `updatedAt` (ISO 8601 UTC)

#### `error-shape`

Error responses MUST conform to:

```json
{
  "error": {
    "code": "<ShortCode>",
    "message": "<human readable>",
    "target": "<optionalFieldName>"
  }
}
```

`code` is a short, stable string (`InvalidInput`, `ValidationFailed`, `ResourceNotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `RateLimitExceeded`, `InternalServerError`). Domain-specific codes are allowed (e.g. `TestLaunchBlocked`).

`target` is optional and names the field that triggered the error.

**Examples**:
- Validation error → `400 Bad Request` with `{ "error": { "code": "InvalidInput", "message": "The testType field is required.", "target": "testType" } }`.
- Not found → `404 Not Found` with `{ "error": { "code": "ResourceNotFound", "message": "..." } }`.

### Identifiers and formats

#### `uuid-v4-ids`

All resource identifiers in URIs and JSON payloads MUST be UUID v4 (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`). Sequential or compound IDs MUST NOT be exposed.

#### `iso-standards`

Format conventions:

- **Timestamps**: ISO 8601 UTC with `Z` suffix (`2025-06-01T10:00:00Z`).
- **Currency**: ISO 4217 codes (`USD`, `EUR`, `GBP`).
- **Language**: ISO 639-1 codes (`en`, `de`, `fr`, `es`).
- **Country**: ISO 3166-1 alpha-2 (`US`, `GB`, `FR`).

### Idempotency and tracing

#### `idempotency-key`

POST endpoints that create resources MUST accept an `Idempotency-Key` HTTP header (UUID v4). Repeated requests with the same key return the same result without creating a duplicate resource.

Behavior:

- First call with key `K` → `201 Created` with the new resource.
- Retry with key `K` and identical body → `200 OK` or `201 Created` with the same resource ID.
- Key `K` with a different body → `409 Conflict` or `400 InvalidInput`.
- Async processing → `202 Accepted`.

#### `x-request-id`

Services MUST accept and propagate `X-Request-ID` for distributed tracing. Structured log lines MUST include the value as a top-level field. Downstream service calls MUST forward the same header so logs across services correlate.

### Database access

#### `read-only-db-for-gets`

All GET operations MUST use read-only database instances to avoid unintentional writes or locks against primary instances.

### Documentation

#### `openapi-spec`

Public and customer-facing APIs MUST have an OpenAPI 3.x specification, versioned alongside the URI version. The spec MUST be kept in sync with the implementation and SHOULD drive both human-readable docs and SDK/client generation.

Required coverage: all paths (with operations), all parameters (path/query/header), request body schemas, response schemas for all status codes, authentication scheme, error model, tags.

---

## Languages Choice Standardization

Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4244308285/Languages+choice+standardization`

UserTesting's language radar classifies languages as ADOPT / ASSESS / HOLD, broken into general-purpose and area-specific.

### General-purpose languages

#### `typescript-node-is-adopt-general-purpose`

TypeScript / Node.js is ADOPT for general-purpose backend services. All new general-purpose backend work targets TypeScript on Node.js. Migrations to NestJS land on TypeScript regardless of the source service's original language.

#### `go-is-assess-performance-focused`

Go is ASSESS — acceptable for performance-focused projects on a case-by-case basis. Adoption requires justified metrics (latency targets, throughput needs, footprint constraints) documented in the proposal before approval.

#### `ruby-scala-java-clojure-on-hold`

Ruby, Scala, Java, and Clojure are HOLD. No big new projects; maintenance, dependency updates, and hotfixes are acceptable. New project proposals targeting any of these SHALL be rejected — the project SHALL target TypeScript/Node.js (or Go after the ASSESS gate).

### Area-specific languages

#### `python-is-adopt-data-ml`

Python is ADOPT for data analysis and machine learning. New ML pipelines target Python.

#### `swift-is-adopt-ios`

Swift is ADOPT for iOS app development.

#### `kotlin-is-adopt-android`

Kotlin is ADOPT for Android app development.

---

## Graduation

This skill should move out of its current incubation home when **any** of:

- UserTesting moves the canonical standards into a versioned reference the skill can fetch programmatically (the skill then becomes a thin fetcher rather than a content snapshot).
- A second organization mirrors the pattern with its own `<org>-standards` skill, at which point the shape becomes a reusable template.
- The skill is consumed by three or more sibling skills, justifying a dedicated package.

Procedure: follow the graduation steps in the host repo's skills README.

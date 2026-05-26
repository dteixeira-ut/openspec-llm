---
name: ut-standards
description: Authoritative reference body encoding UserTesting's architecture-standards Confluence pages (Framework Standardization, REST API Standard, Languages Choice Standardization) as named, citeable rules with WHEN/THEN scenarios. Invoked by other skills (e.g. migrate-to-nestjs) at planning time to load org-normative constraints.
license: MIT
compatibility: UserTesting-specific by design. Consumers outside UT should fork this skill or substitute their own organization's standards skill that uses the same rule-name vocabulary.
metadata:
  author: insight-out
  version: "1.0"
---

# `ut-standards`

This skill is a **reference body**, not a runnable procedure. Other skills invoke it at planning time to load UserTesting's architecture standards into the agent's context, then cite specific rules by stable name (e.g. `error-shape`, `audience-prefix`, `idempotency-key`).

## Self-check — UT-specific by design

Unlike most skills in this collection, this skill is **intentionally** organization-specific. It encodes three UserTesting Confluence pages as their canonical content snapshot. Consumers outside UserTesting MUST either:

- Fork this skill, replace the three Confluence URLs with their organization's equivalents, and substitute the rule bodies; OR
- Author a parallel `<org>-standards` skill that uses the same rule-name vocabulary so cross-references in consumer skills (e.g. `migrate-to-nestjs`) continue to resolve.

**Substitution surface** (the items external consumers MUST replace):

- The three Confluence URLs in the sections below.
- UT-specific resource names in scenarios (e.g. `tests`, `workspaces`, `audiences`, `sessions`).
- The `insight-out` author value in frontmatter.

**Portability invariant**: this skill body MUST NOT name the repository that currently hosts it. The skill stays portable so it travels intact when graduated to a new home (a versioned package, an internal UT repo, or a graduated location chosen by maintainers).

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
- One or more WHEN/THEN scenarios so consumers can cite the conditions under which the rule fires.

Consuming skills reference rules by name in prose: *"see `error-shape` in `ut-standards`"*. They MUST NOT duplicate rule bodies; if a body must be quoted, the consuming skill links rather than copies.

---

## Framework Standardization

Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4362305794/Framework+standardization`

UserTesting's framework radar classifies frameworks as ADOPT / ASSESS / HOLD. This section encodes the current radar status (as of October 2025).

### Backend frameworks

#### `nest-is-target-framework`

**Status**: Nest.js is ADOPT for new backend Node.js services.

##### Scenario: Scaffolding a new Node.js service
- **WHEN** a scaffolding decision is needed for a new backend Node.js service
- **THEN** the choice SHALL be Nest.js

##### Scenario: Migration target framework
- **WHEN** a legacy backend Node.js service is being migrated
- **THEN** the target framework SHALL be Nest.js

#### `legacy-source-is-on-hold`

**Status**: Express, hapi, Mali, grpcServer (hand-rolled `@grpc/grpc-js`), and ApolloServer are HOLD frameworks. No new projects in these frameworks; maintenance is acceptable; migration to Nest.js is encouraged (not mandatory).

##### Scenario: Existing service on a HOLD framework receives a bugfix
- **WHEN** an existing service on Express/hapi/Mali/grpcServer/ApolloServer needs a bugfix or small enhancement
- **THEN** the change MAY land on the existing framework without requiring a Nest.js migration

##### Scenario: New project proposal targets a HOLD framework
- **WHEN** a new project proposal targets Express/hapi/Mali/grpcServer/ApolloServer
- **THEN** the proposal SHALL be rejected; the project SHALL target Nest.js instead

##### Scenario: Migration source qualifier
- **WHEN** the `migrate-to-nestjs` skill validates whether its source framework is in scope
- **THEN** Express, hapi, Mali, grpcServer, and ApolloServer SHALL be accepted as in-scope sources

### Frontend frameworks

#### `react-is-target-frontend`

**Status**: React is ADOPT for new frontend development.

##### Scenario: New frontend feature
- **WHEN** a new frontend feature is being scaffolded
- **THEN** the choice SHALL be React

#### `angular-is-on-hold`

**Status**: Angular is HOLD. Maintenance is acceptable; migration to React is encouraged (not mandatory). No new projects in Angular.

##### Scenario: Existing Angular app receives a feature
- **WHEN** an existing Angular app receives a small feature or bugfix
- **THEN** the change MAY land on the Angular codebase without requiring a React migration

##### Scenario: New frontend project targets Angular
- **WHEN** a new frontend project proposal targets Angular
- **THEN** the proposal SHALL be rejected; the project SHALL target React instead

---

## REST API Standard

Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4221698350/UT+REST+API+Standard`

All UserTesting REST APIs SHALL honor the rules below. Each rule has a stable kebab-case name; consuming skills cite the rule name and trust the body here as canonical.

### URI and routing

#### `audience-prefix`

Internal service URIs SHALL be prefixed with the audience category: `/app|/admin|/api|/internal`. The four categories are:

- `app` — APIs used by the frontend (logged-in customers via browser/mobile).
- `admin` — privileged APIs for internal UT admin tools.
- `api` — public APIs for developers and integrations.
- `internal` — backend-only APIs for service-to-service communication.

The audience prefix is enforced at the service layer; the gateway maps the prefix to audience-specific external domains (e.g. `app.usertesting.com`, `internal.usertesting.com`). URI segmentation alone does NOT enforce access control — authorization rules SHALL be applied independently.

##### Scenario: Frontend-facing service
- **WHEN** a service exposes APIs consumed by the customer-facing frontend
- **THEN** its URIs SHALL be prefixed `/app/v<n>/`

##### Scenario: Service-to-service API
- **WHEN** a service exposes APIs consumed only by other backend services
- **THEN** its URIs SHALL be prefixed `/internal/v<n>/`

#### `uri-versioning`

APIs SHALL use URI versioning (`/v1/`, `/v2/`, …); query-string and header versioning are NOT allowed. Bump the major version only for breaking changes; additive changes (new optional fields, new endpoints) SHALL NOT bump the version.

##### Scenario: New endpoint added
- **WHEN** a new endpoint is added without changing existing behavior
- **THEN** the URI version SHALL remain unchanged

##### Scenario: Breaking schema change
- **WHEN** a response schema is changed in a backwards-incompatible way (e.g. a field is renamed or removed)
- **THEN** the URI version SHALL be bumped (`/v1/` → `/v2/`)

#### `action-sub-resources`

Non-CRUD operations SHALL be modeled as `POST /<resource>/{uuid}/<actionVerb>` sub-resources. Action verbs SHALL NOT appear as query parameters or as top-level URI segments.

##### Scenario: Launch a test
- **WHEN** a "launch test" operation is exposed
- **THEN** the URI SHALL be `POST /app/v1/tests/{uuid}/launch` (NOT `POST /app/v1/launchTest` or `GET /app/v1/tests/{uuid}?action=launch`)

#### `monitoring-endpoint`

When operational monitoring is exposed at the resource level, the URI SHALL be `GET /<resourceType>/{id}/monitor` returning the structured operational status payload prescribed by the standard.

##### Scenario: Test execution monitoring
- **WHEN** a client needs to monitor the execution status of a running test
- **THEN** the URI SHALL be `GET /app/v1/tests/{uuid}/monitor`

### HTTP methods

#### `http-method-semantics`

HTTP methods SHALL be used per their canonical semantics:

- `GET` — safe and idempotent; reads only. Supports filtering, sorting, pagination via query params. Returns `200 OK` or `404 Not Found`.
- `POST` — resource creation only. Returns `201 Created` with a `Location` header (or `202 Accepted` for async). Must NOT be used for update or delete.
- `PUT` — full resource replacement. Omitted fields are cleared. Returns `200 OK`, `204 No Content`, or `404 Not Found`.
- `PATCH` — partial update. Returns `200 OK`, `204 No Content`, or `404 Not Found`.
- `DELETE` — idempotent. Returns `204 No Content` if successful, or `404 Not Found`.

##### Scenario: Update a single field
- **WHEN** a client needs to rename a test (a partial update)
- **THEN** the method SHALL be `PATCH /app/v1/tests/{uuid}`, NOT `POST` or `PUT`

#### `batch-query-pattern`

Multi-resource fetch SHALL use `POST /<resource>/query` with a body of IDs or filters. This is for read operations only and SHALL NOT be used for creation or update.

##### Scenario: Fetch multiple resources by ID
- **WHEN** a client needs to fetch a known set of resources by ID and the list is too long for a GET query string
- **THEN** the URI SHALL be `POST /internal/v1/<resource>/query` with the IDs in the request body, returning a standard `200 OK` collection response

### Request and response shape

#### `json-content-type`

All requests and responses SHALL use `application/json`. JSON property names SHALL be camelCase. The top-level JSON value SHALL be an object — never an array, never a primitive.

##### Scenario: List endpoint top-level shape
- **WHEN** a list endpoint returns a collection of resources
- **THEN** the top-level response value SHALL be an object containing `items` and `meta`, NOT a bare array

#### `pagination-shape`

List endpoints SHALL return:

```json
{
  "items": [ /* summary objects */ ],
  "meta": { "total": <n>, "limit": <n>, "offset": <n> }
}
```

with `limit` and `offset` query parameters. The `items` array contains summary objects (see `summary-vs-detail-responses`).

##### Scenario: Default pagination shape
- **WHEN** a list endpoint is implemented
- **THEN** the response SHALL contain `items: []` and `meta: { total, limit, offset }`

#### `summary-vs-detail-responses`

List endpoints SHALL return summary objects (small representation; minimal fields). Single-resource endpoints SHALL return full detail objects. Expensive attributes SHOULD be modeled as child resources to keep detail responses bounded.

##### Scenario: List endpoint payload
- **WHEN** `GET /app/v1/workspaces` returns the list of workspaces
- **THEN** each item SHALL be a summary object (id, name, status) — NOT the full workspace object

##### Scenario: Single-resource payload
- **WHEN** `GET /app/v1/workspaces/{uuid}` returns one workspace
- **THEN** the response SHALL be the full detail object (id, name, status, owner, settings, createdAt, updatedAt)

#### `required-resource-attributes`

Every resource response SHALL include:

- `id` (UUID v4)
- `name`
- `description`
- `createdAt` (ISO 8601 UTC)
- `updatedAt` (ISO 8601 UTC)

##### Scenario: Required attributes present
- **WHEN** any resource is returned from any endpoint
- **THEN** all five attributes (`id`, `name`, `description`, `createdAt`, `updatedAt`) SHALL be present in the JSON payload

#### `error-shape`

Error responses SHALL conform to:

```json
{
  "error": {
    "code": "<ShortCode>",
    "message": "<human readable>",
    "target": "<optionalFieldName>"
  }
}
```

`code` SHALL be a short, stable string (e.g. `InvalidInput`, `ValidationFailed`, `ResourceNotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `RateLimitExceeded`, `InternalServerError`). Domain-specific codes are allowed (e.g. `TestLaunchBlocked`).

`target` is optional and names the field that triggered the error (when applicable).

##### Scenario: Validation error response
- **WHEN** a POST endpoint receives a request missing a required field
- **THEN** the response SHALL be `400 Bad Request` with body `{ "error": { "code": "InvalidInput", "message": "The testType field is required.", "target": "testType" } }`

##### Scenario: Resource not found
- **WHEN** a GET endpoint is called with an ID that does not exist
- **THEN** the response SHALL be `404 Not Found` with body `{ "error": { "code": "ResourceNotFound", "message": "..." } }`

### Identifiers and formats

#### `uuid-v4-ids`

All resource identifiers in URIs and JSON payloads SHALL be UUID v4 (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`). Sequential or compound IDs SHALL NOT be exposed.

##### Scenario: Resource creation returns UUID
- **WHEN** a POST endpoint creates a resource
- **THEN** the returned `id` SHALL be a UUID v4 (NOT an auto-increment integer, NOT a slug)

#### `iso-standards`

Format conventions:

- **Timestamps**: ISO 8601 UTC with `Z` suffix (`2025-06-01T10:00:00Z`).
- **Currency**: ISO 4217 codes (`USD`, `EUR`, `GBP`).
- **Language**: ISO 639-1 codes (`en`, `de`, `fr`, `es`).
- **Country**: ISO 3166-1 alpha-2 (`US`, `GB`, `FR`).

##### Scenario: Timestamp format
- **WHEN** any timestamp is returned in a JSON payload
- **THEN** the value SHALL be an ISO 8601 string with explicit UTC offset (`Z`)

### Idempotency and tracing

#### `idempotency-key`

POST endpoints that create resources SHALL accept an `Idempotency-Key` HTTP header (UUID v4). Repeated requests with the same key SHALL return the same result without creating a duplicate resource.

- First call with key `K` → `201 Created` with the new resource.
- Retry with key `K` and identical body → `200 OK` or `201 Created` with the same resource ID.
- Key `K` with a different body → `409 Conflict` or `400 InvalidInput`.
- Async processing → `202 Accepted`.

##### Scenario: Network retry deduplicated
- **WHEN** a client sends `POST /app/v1/tests` with `Idempotency-Key: <uuid>`, receives no response (network failure), and retries with the same key and body
- **THEN** the server SHALL return the same resource ID as the first call, without creating a duplicate

#### `x-request-id`

Services SHALL accept and propagate `X-Request-ID` for distributed tracing. Structured log lines SHALL include the value as a top-level field.

##### Scenario: Request ID propagated
- **WHEN** a service receives a request with `X-Request-ID: <id>` and calls a downstream service
- **THEN** the downstream request SHALL include the same `X-Request-ID` header; logs from both services SHALL include the ID

### Database access

#### `read-only-db-for-gets`

All GET operations SHALL use read-only database instances to avoid unintentional writes or locks against primary instances.

##### Scenario: List endpoint database routing
- **WHEN** `GET /app/v1/tests` is implemented and the service has read-replica DB endpoints
- **THEN** the implementation SHALL route the query to a read-only replica, NOT the primary

### Documentation

#### `openapi-spec`

Public and customer-facing APIs SHALL have an OpenAPI 3.x specification, versioned alongside the URI version. The spec SHALL be kept in sync with the implementation and SHALL drive both human-readable docs and SDK/client generation.

OpenAPI coverage SHALL include: all paths (with operations), all parameters (path/query/header), request body schemas, response schemas for all status codes, authentication scheme, error model, tags.

##### Scenario: New public endpoint
- **WHEN** a new endpoint is added to a public or customer-facing API
- **THEN** the OpenAPI spec SHALL be updated in the same PR with paths, parameters, request/response schemas, and security schemes

---

## Languages Choice Standardization

Confluence: `https://user-testing.atlassian.net/wiki/spaces/ARCH/pages/4244308285/Languages+choice+standardization`

UserTesting's language radar classifies languages as ADOPT / ASSESS / HOLD, broken into general-purpose and area-specific.

### General-purpose languages

#### `typescript-node-is-adopt-general-purpose`

**Status**: TypeScript / Node.js is ADOPT for general-purpose backend services.

##### Scenario: New general-purpose backend service
- **WHEN** a new general-purpose backend service is scaffolded
- **THEN** the language SHALL be TypeScript on Node.js

##### Scenario: Migration source-language check
- **WHEN** the `migrate-to-nestjs` skill is invoked on a service whose source language is not TypeScript/Node.js
- **THEN** the migration SHALL be refused as out-of-scope, citing this rule

#### `go-is-assess-performance-focused`

**Status**: Go is ASSESS. Acceptable for performance-focused projects on a case-by-case basis; requires justified metrics before adoption.

##### Scenario: Performance-focused service proposal
- **WHEN** a new service proposal cites performance characteristics that justify Go over TypeScript
- **THEN** the proposal SHALL document the performance metrics and gain explicit approval before adopting Go

#### `ruby-scala-java-clojure-on-hold`

**Status**: Ruby, Scala, Java, and Clojure are HOLD. No big new projects; maintenance, dependency updates, and hotfixes are acceptable.

##### Scenario: New project proposal targets a HOLD language
- **WHEN** a new project proposal targets Ruby, Scala, Java, or Clojure
- **THEN** the proposal SHALL be rejected; the project SHALL target TypeScript/Node.js or Go (after the Go ASSESS gate)

##### Scenario: Existing service in a HOLD language receives a hotfix
- **WHEN** an existing service in Ruby/Scala/Java/Clojure needs a hotfix or dependency bump
- **THEN** the change MAY land on the existing codebase without requiring a migration

### Area-specific languages

#### `python-is-adopt-data-ml`

**Status**: Python is ADOPT for data analysis and machine learning work.

##### Scenario: New ML pipeline
- **WHEN** a new data-analysis or ML pipeline is scaffolded
- **THEN** the language SHALL be Python

#### `swift-is-adopt-ios`

**Status**: Swift is ADOPT for iOS app development.

##### Scenario: New iOS feature
- **WHEN** a new iOS feature is implemented
- **THEN** the language SHALL be Swift

#### `kotlin-is-adopt-android`

**Status**: Kotlin is ADOPT for Android app development.

##### Scenario: New Android feature
- **WHEN** a new Android feature is implemented
- **THEN** the language SHALL be Kotlin

---

## Graduation

This skill should move out of its current incubation home when **any** of:

- UserTesting moves the canonical standards into a versioned reference the skill can fetch programmatically (the skill then becomes a thin fetcher rather than a content snapshot).
- A second organization mirrors the pattern with its own `<org>-standards` skill, at which point the shape becomes a reusable template (extract a `corp-standards-template` skill).
- The skill is consumed by three or more sibling skills (e.g. `migrate-to-nestjs`, `scaffold-nestjs-service`, `review-rest-api`), justifying a dedicated package.

Procedure: follow the graduation steps in the host repo's skills README.


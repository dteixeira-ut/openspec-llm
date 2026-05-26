## Change Summary: refine-migrate-to-nestjs-skill

### What Was Built

Expanded `migrate-to-nestjs` to be truly source-stack-agnostic via a structured descriptor, added a parallel sibling-source-layout inspection recipe, and introduced a new sibling skill `ut-standards` that encodes UserTesting's three architecture-standards Confluence pages (Framework, REST API, Languages) as authoritative named rules. `migrate-to-nestjs` now invokes `ut-standards` at a named planning step and cross-references its rules by stable identifier (e.g. `error-shape`, `audience-prefix`, `idempotency-key`).

### Why

The skill graduated to a repo-agnostic shape after RAD-75634 but still hard-coded Express + `@grpc/grpc-js` as the only legacy sources, lacked any structured stack input, and inlined per-org rules that should live as a citeable reference. Three post-archive retrofits on the reference migration (`config simplification`, `common/infra split`, `spec colocation`) showed Step-0 sibling inspection covered config files but not source conventions — the recurring retrofit cost was empirical evidence the skill needed both. Meanwhile UserTesting published a Framework Standardization page declaring Nest.js the ADOPT preferred backend Node framework and adding hapi, Mali, ApolloServer alongside Express + grpcServer on HOLD, broadening the skill's intended scope.

### Key Decisions

- **Closed-list source-stack descriptor** (`http`, `rpc`, `orm`, `queue`, `validator`) with unmapped values triggering a must-ask. Trade-off: forces the closed-list keeper to maintain coverage, but eliminates judgment-based capability slicing.
- **Sibling reference is OPTIONAL with a verbatim retrofit-risk warning when absent.** Not every team has a NestJS reference to point at; gating adoption on one would block fresh adopters. The warning informs the tradeoff without blocking the migration.
- **UT standards live in a dedicated sibling skill `ut-standards`, not inlined.** Rejected `openspec/config.yaml` rules (over-apply across the repo and couple it to one org) and inline rules (block future reuse). The standards skill is invoked by consumers at planning time; rule bodies live there and are referenced by stable name elsewhere.
- **Standards skill is portable** — no host-repo name in any SKILL.md or recipe. Skill body refers to "this incubation repo" / "the host repo" so the skill travels intact when graduated.
- **Error shape per `ut-standards`' `error-shape` rule** (`{ error: { code, message, target } }`) replaces the prior "documented schema" guidance, which was project-specific and predated the UT REST API Standard.

### Spec Changes

- **skill-migrate-to-nestjs** (modified): 1 MODIFIED requirement (Step 0 sibling-file inspection now coordinates with the source-layout inspection) + 7 ADDED requirements (source-stack descriptor; capability derivation table; source-layout inspection; optional sibling with warning; invocation of `ut-standards`; new must-ask classes; full HOLD-set framework coverage).
- **skill-ut-standards** (created): 6 ADDED requirements covering skill existence + frontmatter; Framework Standardization section (2 named rules); REST API Standard section (17 named rules); Languages Choice Standardization section (7 named rules); consumability via named-rule references; graduation criteria.

### Tasks Completed

**30/33 tasks complete** (3 deferred: 10.3 post-archive validation, 12.1 PR creation, 12.2 archive itself — handled by the orchestrating session after this summary).

- **Groups 1, 2, 4, 5, 6, 9** — `skills/migrate-to-nestjs/SKILL.md` rewrite (Inputs with source-stack descriptor + optional `referenceCodebase`; expanded "When to use" framework list; Step 0a/0b split; new Step 0.5 invocation; capability derivation table; standards cross-reference section; 4 new must-ask classes; error-shape per `ut-standards`).
- **Group 3** — Created `skills/ut-standards/SKILL.md` with all 3 standards sections + 24 named rules + graduation criteria + portability assertion (zero host-repo references).
- **Groups 7, 8** — Created `skills/migrate-to-nestjs/recipes/sibling-source-layout-checklist.md`; updated `recipes/sibling-file-diff-checklist.md` preamble with link-back.
- **Group 10** — Living-spec updates deferred to `openspec archive`, which auto-promoted 7 ADDED + 1 MODIFIED to `skill-migrate-to-nestjs` and created `skill-ut-standards` with 6 ADDED.
- **Group 11** — Strict validation passed; portability greps clean; spec-requirement → task traceability verified.

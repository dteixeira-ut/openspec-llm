# Sibling source-layout checklist (Step 0b of `migrate-to-nestjs`)

This recipe inspects **source conventions** in a sibling NestJS reference service so the migrating service can mirror them in its foundation. See also the companion recipe [`sibling-file-diff-checklist.md`](./sibling-file-diff-checklist.md), which inspects **config-tooling files** (Prettier, ESLint, tsconfig, Dockerfile, CI workflows) and produces a reconciliation commit. This recipe produces a different output: a **convention manifest** markdown document attached to the foundation proposal.

Pick a **sibling reference**: an existing NestJS service in the same organization. If none is available, this checklist runs against the canonical NestJS starter (`nest new <name>` output); the convention manifest records "default per NestJS docs" entries rather than sibling-derived ones, AND the foundation proposal MUST carry the verbatim retrofit-risk warning from `migrate-to-nestjs/SKILL.md`'s `Inputs` section.

For each row: inspect the sibling reference and record what convention the migrating service MUST adopt in its foundation.

## Checklist

### `src/` directory layout

- [ ] Does the sibling split into `common/`, `infra/`, `features/<name>/` (the three-folder split) or use a flatter shape?
- [ ] If three-folder split: what lives under each (`common/` is usually cross-cutting; `infra/` is usually external clients; `features/<name>/` is per-domain)?
- [ ] Does the sibling have a separate `config/` directory at the top of `src/`, or is config wired inside `common/` / `infra/`?
- [ ] Does the sibling have `repositories/` (Drizzle/TypeORM access) as its own top-level under `src/`, or is it folded into `features/<name>/repositories/`?
- [ ] Does the sibling have `dags/` or other domain-specific top-level directories that should be preserved if the migrating service has the same concept?
- **Action**: record the sibling's `src/` layout shape in the convention manifest. The foundation PR mirrors it.

### Configuration module shape

- [ ] Singleton TS module (one exported object, no Nest DI) vs. NestJS DI provider with `ConfigModule.forRoot(...)`?
- [ ] zod-validated schema vs. plain TypeScript interface?
- [ ] File-loader location: inline in the module, or a separate file (`config/loader.ts`)?
- [ ] Env-overlay convention: which env vars override which JSON keys? Is the overlay list explicit or convention-based?
- [ ] How are secrets passed in (env vars only, mounted files, secret manager SDK)?
- **Action**: record the config shape in the manifest. The foundation's `<service>-config` capability mirrors it.

### Logger module shape

- [ ] `LoggerModule.forRoot(...)` (sync) vs. `LoggerModule.forRootAsync(...)` (async, reading config at init)?
- [ ] Is `nestjs-pino` used? With which `pinoHttp` config? Any custom serializers?
- [ ] Are log fields decorated centrally (e.g. a global request-context) or per call site?
- [ ] What's the `level` resolution path (env var → config key → default)?
- **Action**: record the logger shape in the manifest. The foundation's `<service>-logger` capability mirrors it.

### Exception filter shape

- [ ] Platform-agnostic via `HttpAdapterHost` (NestJS-idiomatic) or platform-specific imports (e.g. raw Express types)?
- [ ] Single global filter or multiple (e.g. one for HTTP, one for gRPC)?
- [ ] How does the filter shape its output? (For UT services this MUST conform to `error-shape` in `ut-standards` regardless of sibling convention; flag the divergence if the sibling differs.)
- **Action**: record the filter shape in the manifest. The foundation's `<service>-bootstrap` capability mirrors it. If sibling vs `ut-standards`' `error-shape` conflict, surface as a must-ask per `migrate-to-nestjs/SKILL.md`.

### Test layout

- [ ] Colocated `*.spec.ts` next to source files (NestJS-idiomatic), or a separate `test/` tree mirroring `src/` (Java-style)?
- [ ] Does the sibling use `*.spec.ts` vs `*.test.ts` (or both)?
- **Action**: record the test layout in the manifest. The foundation produces tests in the sibling's style. Default to colocated when no sibling is available.

### Test infrastructure placement

- [ ] Cross-cutting test helpers under `src/test/*` with a `tsconfig.json` `paths` alias (e.g. `#/*` → `src/test/*`), or under root-level `test/`?
- [ ] Shared `Test.createTestingModule` factory in `src/test/test-module.factory.ts` or `test/factories/...`?
- [ ] Where do testcontainers globalSetup / globalTeardown live (jest config root or test infra folder)?
- **Action**: record the test-infra placement in the manifest. The foundation's `<service>-test-scaffolding` capability mirrors it.

### File naming conventions

- [ ] File-name casing: PascalCase (`UserController.ts`) vs kebab-case (`user.controller.ts`)?
- [ ] Suffix patterns: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.domain.ts`, `*.repository.ts`?
- [ ] Naming of feature folders (`features/users/` vs `features/user/`)?
- [ ] Class-name casing inside files (always PascalCase, but check for variations)?
- **Action**: record the naming convention in the manifest. The foundation produces files matching the sibling.

## Output

Produce a single markdown document — the **convention manifest** — attached to the foundation proposal at `openspec/changes/<change-name>/convention-manifest.md` (or equivalent). The manifest is a planning artifact, NOT a commit; the foundation PR consumes it during code generation.

Manifest shape:

```markdown
# Convention manifest — <service> NestJS foundation

Source: <sibling reference path, OR "no sibling; NestJS docs defaults">

## src/ layout

<the choice recorded>

## Config module shape

<the choice recorded>

## Logger module shape

<the choice recorded>

## Exception filter shape

<the choice recorded>

## Test layout

<the choice recorded>

## Test infra placement

<the choice recorded>

## Naming conventions

<the choice recorded>

## Conflicts surfaced

<any must-ask classes triggered during inspection — e.g. sibling error shape vs ut-standards error-shape rule>
```

The convention manifest is consumed by `/opsx:apply` (or the equivalent code-generating agent) when it authors the foundation PR's capability code. Conflicts surfaced in the manifest are resolved at planning time, not at apply time.

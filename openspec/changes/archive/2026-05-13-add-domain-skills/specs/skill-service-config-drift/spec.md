## ADDED Requirements

### Requirement: `service-config-drift` skill SHALL exist at `skills/service-config-drift/SKILL.md`

A skill named `service-config-drift` SHALL be present at `skills/service-config-drift/SKILL.md`, codifying auditors that detect configuration mismatches in TypeScript backend repos that bite at deploy time.

#### Scenario: Skill present
- **WHEN** the change is merged
- **THEN** `skills/service-config-drift/SKILL.md` SHALL exist and SHALL declare repo-agnostic framing per the `domain-skills-home` capability

### Requirement: The skill SHALL run three auditors as a single invocation

A single invocation of the skill SHALL execute all three auditors (`prettierrc-parser-plugins`, `dockerfile-entrypoint`, `ci-fmt-gate`) and produce one consolidated report.

#### Scenario: Single invocation, multiple checks
- **WHEN** the skill is invoked against a target repo
- **THEN** the resulting report SHALL include a section per auditor, each with status (`pass` / `fail` / `skipped`) and any findings

#### Scenario: Auditor skipped due to missing precondition
- **WHEN** an auditor's precondition is not met (e.g. `dockerfile-entrypoint` runs against a repo with no `Dockerfile`)
- **THEN** the auditor SHALL report `skipped` with a one-line reason and SHALL NOT block the other auditors

### Requirement: The prettierrc parser-plugins auditor SHALL detect missing `decorators-legacy`

The `prettierrc-parser-plugins` auditor SHALL verify that when the target repo contains TypeScript source files using decorators (e.g. `@Injectable()`, `@Module()`, `@Controller()`), the prettier configuration's `importOrderParserPlugins` array includes `decorators-legacy` (or equivalent for the `@trivago/prettier-plugin-sort-imports` plugin in use).

#### Scenario: Decorator-using repo missing parser plugin
- **WHEN** the target repo contains `.ts` files with `@Injectable()` or similar decorator usage and the `.prettierrc` does not include `decorators-legacy` in `importOrderParserPlugins`
- **THEN** the auditor SHALL report `fail` and SHALL name the missing entry plus the one-line fix

#### Scenario: Non-decorator repo
- **WHEN** the target repo has no decorator usage
- **THEN** the auditor SHALL report `pass` regardless of `.prettierrc` contents (the plugin entry is inert)

### Requirement: The Dockerfile entrypoint auditor SHALL detect dangling references

The `dockerfile-entrypoint` auditor SHALL grep the repo's `Dockerfile`(s) for `CMD ["node", "dist/<x>.js"]` or `ENTRYPOINT` patterns and SHALL verify that `src/<x>.ts` (or `<x>.ts` under any source root declared in `tsconfig.json`) exists.

#### Scenario: Dangling entrypoint
- **WHEN** the `Dockerfile` declares `CMD ["node", "dist/index.js"]` and no `src/index.ts` exists
- **THEN** the auditor SHALL report `fail` with the dangling reference, the absent source file, and a list of candidate source files (e.g. `src/main.ts`) that could replace it

#### Scenario: Build copies missing necessary configs
- **WHEN** the `Dockerfile`'s builder stage runs `nest build` (or `npm run build` where the script invokes `nest build`) but the `COPY` instructions do not include `tsconfig.build.json` or `nest-cli.json`, and those files exist in the repo
- **THEN** the auditor SHALL report `fail` with the missing copies (image will ship spec files and bloat)

### Requirement: The CI fmt-gate auditor SHALL detect missing `fmt` in CI

The `ci-fmt-gate` auditor SHALL verify that when `package.json` declares an `fmt` (or `fmt:check`) script, that script is invoked by at least one workflow under `.github/workflows/`.

#### Scenario: Repo has fmt script, CI does not run it
- **WHEN** `package.json` `scripts.fmt` exists and no workflow under `.github/workflows/*.yml` calls `npm run fmt` or `pnpm fmt` or similar
- **THEN** the auditor SHALL report `fail` and SHALL suggest a one-line addition to the existing lint workflow

#### Scenario: Repo has no fmt script
- **WHEN** `package.json` does not declare an `fmt` script
- **THEN** the auditor SHALL report `skipped` with reason "no `fmt` script in `package.json`"

### Requirement: Each auditor SHALL be documented in its own file

`SKILL.md` SHALL reference each auditor's documentation at `skills/service-config-drift/auditors/<auditor-name>.md`. Each auditor file SHALL document: precondition, check logic, failure output shape, and the one-line fix.

#### Scenario: Adding a fourth auditor
- **WHEN** a contributor wants to add a new auditor (e.g. `tsconfig-strict-mode`)
- **THEN** they SHALL add a new file under `auditors/` documenting the check, add an invocation step to `SKILL.md`, and update this living spec with a new requirement — all in one OpenSpec change

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

The inspection SHALL produce one reconciliation commit before any NestJS source file is added.

#### Scenario: Missing parser plugin in prettier config
- **WHEN** the sibling reference's prettier config includes `decorators-legacy` in `importOrderParserPlugins` and the migrating service's does not
- **THEN** the skill SHALL direct the agent to add the plugin entry in the reconciliation commit

#### Scenario: Mismatched Dockerfile copy list
- **WHEN** the sibling reference's `Dockerfile` copies `tsconfig.build.json` and `nest-cli.json` into the build stage and the migrating service's does not
- **THEN** the skill SHALL direct the agent to add those copies in the reconciliation commit

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


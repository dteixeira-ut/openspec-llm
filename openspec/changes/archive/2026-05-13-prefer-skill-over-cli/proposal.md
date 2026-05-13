## Why

The `harden-opsx-workflow` change (PR #9) just shipped a set of workflow rules — and applying that change immediately surfaced a new gap the rules don't cover. After archiving via `openspec archive` (the CLI) in two worktrees, no `summary.md` was generated, despite `openspec/config.yaml` declaring `hooks.post-archive: [/opsx:summarize]`. Root cause: the hook is implemented at **step 7 of the `/opsx:archive` skill body**, not in the underlying `openspec` CLI. Any LLM (or human) bypassing the skill silently drops the hook. The same divergence pattern can affect any `openspec` CLI subcommand whose corresponding skill documents side effects, but it is invisible from a CLI-only perspective. This change codifies the rule that LLMs MUST prefer the skill when side effects are declared, so the failure mode does not recur.

## What Changes

- Add a new requirement to the `opsx-workflow` living spec: workflow operations with declared side effects (hooks, post-actions) SHALL be invoked via the corresponding `/opsx:*` skill rather than the underlying `openspec` CLI. Three scenarios cover skill-with-hooks (must use skill), skill-without-hooks (either acceptable), and skill-unreachable (must-ask escalation, log per the silent-decisions marker rule).
- Add a short "Workflow-tool invocation" section to repo-root `CLAUDE.md` pointing at the rule and naming the specific CLIs with skill-side hooks today (currently: `openspec archive` ↔ `/opsx:archive` via `hooks.post-archive`).
- Add a one-line guardrail near the top of each affected command file (`/opsx:archive` today; future commands as they gain hooks) explicitly directing LLMs not to bypass the skill via the CLI.

## Capabilities

### New Capabilities
<!-- None. -->

### Modified Capabilities
- `opsx-workflow`: gains one ADDED Requirement covering skill-vs-CLI preference for workflow operations with declared side effects.

## Impact

- **Files touched**: `openspec/specs/opsx-workflow/spec.md` (via the standard archive sync from this change's delta), `CLAUDE.md`, `.claude/commands/opsx/archive.md`. No CLI changes (the underlying `openspec` tool is out of this team's control); the rule lives at the agent-instruction layer only.
- **Workflow consumers**: every active or future `/opsx:*` skill invocation by an LLM inherits the new rule via the `opsx-workflow` living spec and the `CLAUDE.md` pointer. Existing archived changes are not retroactively re-validated.
- **CI**: no workflow-file changes. The spec-drift monitor (already watching `openspec/specs/opsx-workflow/spec.md` after #9 merges) will police future regressions to this rule.
- **Dependencies**: this change depends on PR #9 (`harden-opsx-workflow`) being merged so the `opsx-workflow` capability exists in `openspec/specs/`. It is opened stacked on PR #9's branch.
- **Non-code surfaces**:
  - Config load: N/A — no config changes.
  - Secrets: N/A.
  - Container/deploy artifacts: N/A.
  - CI workflows: N/A — no workflow-file changes; the spec-drift monitor's existing glob (`openspec/specs/**/spec.md`) catches the modified spec automatically.
  - Observability: N/A.
- **Starting state**: brownfield — `opsx-workflow` spec already exists (on PR #9's branch / post-merge on main).
- **Cutover**: in-place. Adds a requirement; no removals; no replacements.
- **Out of scope**:
  - Modifying the `openspec` CLI to read and execute `hooks.post-archive` itself. That's the more durable fix but it's upstream of this team's repo. A follow-up issue against the CLI tracks that path.
  - A pre-commit / CI check that fails if an archive directory exists without `summary.md`. Worth considering separately but not bundled here — this change is the rule, not the enforcement gate.

## Decisions made without consultation

Per the silent-decisions marker rule from `harden-opsx-workflow` (which this change extends), recording silent calls made while drafting:

1. **Scope is the rule only, not the CLI fix.** Modifying the `openspec` CLI to read hooks is the more durable fix but lives upstream and is out of scope. The agent-level rule is the cheap, in-repo fix that works today. Alternative considered: bundle a fork or shim of the CLI — rejected as overkill.
2. **PR is stacked on PR #9** rather than waiting for #9 to merge. Reason: dogfoods the stacked-mid-implementation mode that #9 introduces, and the rule it adds is the kind of thing reviewers of #9 will want to see at the same time. Alternative considered: wait for #9 to merge then open against main — rejected because the rule directly responds to a finding from #9's own implementation, and decoupling them in time would weaken the case-study narrative.
3. **CLAUDE.md gets a pointer, not the full rule text.** CLAUDE.md is already approaching 50 lines; copying the full rule there would duplicate the spec content and risk drift. A one-paragraph pointer with the today-applicable specifics (`openspec archive` ↔ `/opsx:archive`) preserves discoverability without duplication.
4. **One-line note in `/opsx:archive` is belt-and-suspenders.** Strictly redundant with CLAUDE.md and the living spec, but agents reading the skill body directly (e.g. when re-implementing or debugging) may not have read CLAUDE.md or the spec in the same session. The cost is one line; the benefit is local enforcement.
5. **No new capability `opsx-tooling-invocation` (or similar).** The rule belongs in `opsx-workflow` because it governs how the workflow's operations are invoked — splitting it into its own capability would be premature partitioning at this scale. If more rules of this class accumulate, a future split is cheap.

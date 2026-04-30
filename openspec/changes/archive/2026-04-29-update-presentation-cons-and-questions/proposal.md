## Why

The "What We're Not Sure About" slide understates some real limitations of the OpenSpec workflow, and the "Open Questions" slide is missing several important questions around development flow, branch governance, and spec conflict resolution. Updating these now makes the presentation more honest and sparks the right discussions.

## What Changes

- Rephrase the spec-drift bullet on the cons slide to clarify that drift happens mid-implementation (from imprecise specs), not only when archive is skipped
- Add three new bullets to the cons slide: spec verbosity and reviewability, code quality not guaranteed by working code, and the need for guardrails and feedback loops
- Add three new numbered items to the open questions slide covering: the end-to-end development flow (spec review, auto-validation, refinement loop), branch protection for unarchived changes, and hypothetical merge conflict handling on spec archives

## Capabilities

### New Capabilities
<!-- None — this change modifies existing presentation content only -->

### Modified Capabilities
- `presentation-content`: Updated cons slide bullets and open questions list to reflect new insights and discussion topics

## Impact

- `apps/presentation/src/slides.ts`: cons slide (id: `cons`) and open-questions slide (id: `open-questions`)

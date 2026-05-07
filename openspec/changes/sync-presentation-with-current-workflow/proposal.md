## Why

The presentation deck claims to be "built using the workflow it describes," but five OpenSpec skills (`suggest`, `refine`, `review`, `summarize`, `pr`), the mandatory `code-review` subagent gate in `CLAUDE.md`, and the gh-aw `spec-drift-monitor` workflow have all shipped since the last slide update (commit `37f3e04`). The deck and `README.md` still describe "a CLI + four Claude Code skills." Anyone evaluating this approach from the deck today gets an under-spec'd picture, and the deck's dogfooding claim is undermined by every ad-hoc patch that bypasses OpenSpec.

## What Changes

- Restructure the skills section of the deck into three lifecycle phases (**Plan**, **Build**, **Ship & Close**) with section-divider slides framing one slide per skill within each phase.
- Add five new skill slides: `/opsx:suggest`, `/opsx:refine`, `/opsx:review`, `/opsx:summarize`, `/opsx:pr`.
- Add a new "Closing the loop in CI" slide covering the Code Review Gate and the Spec Drift Monitor.
- Update slide 4 (`enter-openspec`) to drop the "four skills" claim and show the full lifecycle in the code block.
- Rewrite three open-questions items as "partially answered — open follow-ups," reflecting what the new skills and CI automation now cover.
- Strengthen the resources slide footer to call out that this update was itself driven through the OpenSpec workflow.
- Update `README.md` to match: drop "four skills," extend the workflow table to cover all skills, and reference the Code Review Gate and Spec Drift Monitor.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `presentation-content`: slide deck content, ordering, and structure change. New section-divider and skill slides are added, slide 4 copy is updated, slide 11 (open questions) is rewritten to reflect partial answers, and the resources slide footer is strengthened. The total slide count and ordering shift.

## Impact

- `apps/presentation/src/slides.ts` — add new slide entries, reorder existing ones, update copy on slides 4, 10, 11, and 12.
- `apps/presentation/src/types.ts` — no type changes expected; section-divider slides reuse existing `subheading` + `text` content types.
- `apps/presentation/src/components/SlideCard.tsx` — no component changes expected; section dividers render as standard slides.
- `README.md` — workflow table and "four skills" wording updated; new rows for additional skills; references to Code Review Gate and Spec Drift Monitor.
- No new dependencies or build changes.
- `presentation-shell` capability is unaffected (navigation, progress indicator, styling, accessibility all unchanged).

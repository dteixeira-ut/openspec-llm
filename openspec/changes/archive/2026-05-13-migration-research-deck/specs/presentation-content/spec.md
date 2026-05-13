## ADDED Requirements

### Requirement: Workflow deck slide source SHALL live at `src/decks/workflow/slides.ts`

The slide array currently at `apps/presentation/src/slides.ts` SHALL be relocated to `apps/presentation/src/decks/workflow/slides.ts` to make room for sibling decks. Content SHALL be moved byte-for-byte; only the file path changes.

The workflow deck content remains the authoritative source for the `/#/workflow` route. All existing requirements about workflow deck content (slide identity, ordering, narrative arc, the `/opsx:*` skill walkthrough) continue to apply unchanged at the new location.

#### Scenario: Move preserves slide content
- **WHEN** `git diff` is run comparing the pre-change `src/slides.ts` with the post-change `src/decks/workflow/slides.ts`
- **THEN** the slide array content SHALL be byte-for-byte identical; only the file location differs

#### Scenario: Consumers updated to new path
- **WHEN** `src/App.tsx` (or the new routing surface) loads the workflow deck
- **THEN** it SHALL import from `./decks/workflow/slides` instead of `./slides`; the old `src/slides.ts` SHALL be removed (or stub-re-exported with a deprecation comment if a transitional period is needed)

#### Scenario: Existing route renders identical content
- **WHEN** a user opens `/#/workflow` after the change
- **THEN** every slide SHALL render with identical content, ordering, and visual treatment to the pre-change deck at `/`

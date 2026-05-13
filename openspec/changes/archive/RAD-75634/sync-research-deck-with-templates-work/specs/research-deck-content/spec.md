## MODIFIED Requirements

### Requirement: Research deck SHALL exist with full and summary density variants

The research deck SHALL be authored at `apps/presentation/src/decks/research/slides.ts` as a single slide array. Each slide SHALL declare a `density` field (`'full' | 'summary' | 'both'`) that drives which route renders it.

#### Scenario: Full deck has ~24–34 slides
- **WHEN** the research deck loads at `/#/research`
- **THEN** the rendered slide list SHALL contain between 24 and 34 slides (target ~28), enough to support the six-section narrative arc declared in design.md Decision 7 with four mitigations covered at 2 slides each

#### Scenario: Summary deck has ~10–16 slides
- **WHEN** the research deck loads at `/#/research/summary`
- **THEN** the rendered slide list SHALL contain between 9 and 17 slides (target ~13), preserving the narrative arc with one slide per section minimum

### Requirement: Research deck narrative SHALL follow the six-section arc

The research deck's slide order SHALL cover six sections in this order: Frame, Process, Findings (by class), Mitigations shipped, Learnings, Close.

Rationale: an earlier draft included a seventh "What's next" section with concrete follow-ups and open questions for the team; on user direction that section was removed so the deck ends on Learnings → Close. Follow-up work is captured in the project's OpenSpec change archive and tracked separately from the case-study record.

#### Scenario: Frame section orients the audience
- **WHEN** a viewer starts the deck
- **THEN** the first 2–3 slides SHALL cover: the experiment goal, the consuming repo (`enriched-video-uploads-v2`, two-service NestJS migration), and what was measured (findings count, PR count, time signals)

#### Scenario: Findings section is organized by class
- **WHEN** a viewer reaches the Findings section
- **THEN** the slides SHALL be grouped by finding class — at minimum: implicit deployment context, silent agent decisions, delivery shape gaps, configuration drift, library-vs-spec mismatch — not by chronological discovery order

#### Scenario: Mitigations section links to all shipped changes
- **WHEN** a viewer reaches the Mitigations section
- **THEN** the slides SHALL name all four shipped mitigations explicitly — `harden-opsx-workflow`, `add-domain-skills`, `single-source-opsx-templates`, and `tool-agnostic-opsx-templates` — AND include direct links (via `finding.mitigation` or `link` content items) to the relevant artifacts in the `openspec/changes/archive/RAD-75634/` tree

#### Scenario: Close slide closes the loop
- **WHEN** a viewer reaches the final slide
- **THEN** the slide SHALL state that this deck was itself built using the workflow it discusses (the dogfooding loop), SHALL acknowledge that two of the four mitigations shipped AFTER the deck was first authored (using that gap as evidence the loop self-corrects), and SHALL include a link to its own OpenSpec change (`migration-research-deck`)

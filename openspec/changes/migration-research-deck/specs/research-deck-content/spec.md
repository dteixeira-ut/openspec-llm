## ADDED Requirements

### Requirement: Research deck SHALL exist with full and summary density variants

The research deck SHALL be authored at `apps/presentation/src/decks/research/slides.ts` as a single slide array. Each slide SHALL declare a `density` field (`'full' | 'summary' | 'both'`) that drives which route renders it.

#### Scenario: Full deck has ~22–28 slides
- **WHEN** the research deck loads at `/#/research`
- **THEN** the rendered slide list SHALL contain between 20 and 30 slides (target ~24), enough to support the six-section narrative arc declared in design.md Decision 7

#### Scenario: Summary deck has ~10–15 slides
- **WHEN** the research deck loads at `/#/research/summary`
- **THEN** the rendered slide list SHALL contain between 9 and 16 slides (target ~12), preserving the narrative arc with one slide per section minimum

### Requirement: Research deck narrative SHALL follow the six-section arc

The research deck's slide order SHALL cover six sections in this order: Frame, Process, Findings (by class), Mitigations shipped, Learnings, Close.

Rationale: an earlier draft included a seventh "What's next" section with concrete follow-ups and open questions for the team; on user direction that section was removed so the deck ends on Learnings → Close. Follow-up work is captured in the project's OpenSpec change archive and tracked separately from the case-study record.

#### Scenario: Frame section orients the audience
- **WHEN** a viewer starts the deck
- **THEN** the first 2–3 slides SHALL cover: the experiment goal, the consuming repo (`enriched-video-uploads-v2`, two-service NestJS migration), and what was measured (findings count, PR count, time signals)

#### Scenario: Findings section is organized by class
- **WHEN** a viewer reaches the Findings section
- **THEN** the slides SHALL be grouped by finding class — at minimum: implicit deployment context, silent agent decisions, delivery shape gaps, configuration drift, library-vs-spec mismatch — not by chronological discovery order

#### Scenario: Mitigations section links to shipped changes
- **WHEN** a viewer reaches the Mitigations section
- **THEN** the slides SHALL name `harden-opsx-workflow` and `add-domain-skills` explicitly AND include direct links (via `finding.mitigation` or `link` content items) to the relevant artifacts in the `openspec/changes/archive/` tree

#### Scenario: Close slide closes the loop
- **WHEN** a viewer reaches the final slide
- **THEN** the slide SHALL state that this deck was itself built using the workflow it discusses (the dogfooding loop) and SHALL include a link to its own OpenSpec change (`migration-research-deck`)

### Requirement: Research deck SHALL embed concrete evidence

The deck SHALL use the new `finding`, `diff`, `metric`, and `timeline` content variants to make the case concretely rather than abstractly.

#### Scenario: Each finding class includes at least one concrete example
- **WHEN** a viewer reaches any finding class in the Findings section
- **THEN** at least one slide in that class SHALL include a `diff`, a `callout` quoting the research notes, or a `finding` content item naming a specific file path or commit SHA from `enriched-video-uploads-v2`

#### Scenario: Rebase cost is presented as a metric
- **WHEN** a viewer reaches the delivery-shape findings
- **THEN** the slides SHALL include at least one `metric` content item with the rebase volume figure from the research notes (~18 cycles) and the time-cost framing (~15–20% of session wall clock)

#### Scenario: Silent decisions are illustrated with a diff
- **WHEN** a viewer reaches the silent-decisions finding class
- **THEN** at least one slide SHALL use a `diff` content item showing the spec-vs-legacy contradiction (e.g. `INVALID_ARGUMENT` vs `FAILED_PRECONDITION` or `logAction(CREATED)` vs `addVideoLogUploaded(UPLOADED)`)

### Requirement: Research deck SHALL cite sources

Every claim about counts, time, or behavior SHALL be traceable to a named source in the research notes or to a commit SHA in `enriched-video-uploads-v2`. Sources SHALL be cited via `callout { tone: 'evidence' }` content items or via inline links in slide bodies.

#### Scenario: Counts cite the research notes
- **WHEN** the deck states a count (slides count, sub-PR count, finding count, rebase cycles)
- **THEN** the same slide SHALL cite `openspec/research/sdd-exploration-notes.md` (or a more specific commit) as the source

#### Scenario: Code claims cite a commit SHA
- **WHEN** the deck shows a code-level finding (a specific file path, a diff)
- **THEN** the slide SHALL include the file path AND a commit SHA from `enriched-video-uploads-v2` so the claim is auditable

### Requirement: Research deck slides SHALL include speaker notes

Each slide SHALL provide a `notes` field with 2–4 sentences elaborating the slide's content for a speaker. Notes SHALL be visible via the existing `NotesPanel` (`n` key toggle).

#### Scenario: Notes are present on every slide
- **WHEN** a slide is rendered in the research deck
- **THEN** the slide SHALL have a non-empty `notes` field

#### Scenario: Notes follow the existing convention
- **WHEN** speaker notes are written
- **THEN** they SHALL follow the existing convention from `src/decks/workflow/slides.ts` (formerly `src/slides.ts`): 2–4 sentences, conversational tone, not a script

### Requirement: Research deck SHALL not depend on assets outside the existing brand kit

The research deck SHALL use only the existing UserTesting logo asset(s) and the `ut-navy` / `ut-blue` / `ut-teal` Tailwind tokens. No new image assets, no new brand colors, no new fonts.

#### Scenario: No new asset files
- **WHEN** the change is merged
- **THEN** `apps/presentation/public/` SHALL contain only the assets that existed before the change

#### Scenario: No new brand tokens
- **WHEN** `tailwind.config.ts` is inspected after the change
- **THEN** the brand color block SHALL contain only the tokens that existed before the change (the research deck's visual distinction is achieved via existing tokens applied differently, not via new tokens)

<!-- The "What's next" requirement was removed on user direction during implementation; follow-up work is tracked outside the case-study record. See the rationale on the narrative-arc requirement above. -->


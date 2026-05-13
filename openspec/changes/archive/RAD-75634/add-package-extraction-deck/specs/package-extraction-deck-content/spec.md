## ADDED Requirements

### Requirement: Package-extraction deck SHALL exist as its own slide module

The package-extraction deck SHALL be authored at
`apps/presentation/src/decks/package-extraction/slides.ts` as a single
slide array exported as `packageExtractionSlides`. Each slide SHALL
satisfy the existing `Slide` interface from `apps/presentation/src/types.ts`
(`id`, `title`, `body`, `notes?`). The deck SHALL NOT use the
`ResearchSlide` shape — there is no `density` field, because this
deck has no summary variant.

#### Scenario: Deck loads at its route
- **WHEN** a viewer opens `/#/package-extraction`
- **THEN** the app SHALL render the deck's slide array via the shared
  `DeckView` component using the deck's own theme

#### Scenario: Slide array shape
- **WHEN** the slide array is read
- **THEN** every entry SHALL declare `id` (kebab-case, unique within
  the array), `title`, and `body` AND MAY declare `notes`; no entry
  SHALL declare a `density` field

### Requirement: Deck SHALL contain between 10 and 14 slides

The rendered slide list SHALL contain between 10 and 14 slides
(target ~12). The bound is intentionally narrow so the deck reads in
a single sitting; growth past 14 SHALL be treated as a signal that a
summary variant is needed, not as a free pass to keep adding slides.

#### Scenario: Slide count is within bounds
- **WHEN** the deck loads at `/#/package-extraction`
- **THEN** the rendered slide count SHALL be between 10 and 14
  inclusive

#### Scenario: Slide count grows past 14
- **WHEN** a contributor proposes a slide that would push the array
  past 14
- **THEN** the proposal SHALL either remove an existing slide, fold
  the new content into an existing slide, or open a separate change
  that lifts this bound and introduces a summary variant

### Requirement: Deck narrative SHALL follow the five-section arc

The deck's slide order SHALL cover five sections in this order:
Frame, Locked decisions, The bin, Drift, Adoption, with a Close
slide as the sixth element. The arc is the same shape as the
research deck (intro → core decisions → mechanism → safety net →
adoption → close).

#### Scenario: Frame section orients the audience
- **WHEN** a viewer starts the deck
- **THEN** the first 1–2 slides SHALL cover: the title of the work
  and the problem statement (why packaging matters once a single
  source of truth exists in one repo)

#### Scenario: Locked-decisions section quotes memory verbatim
- **WHEN** a viewer reaches the locked-decisions section
- **THEN** the slides SHALL state each of the five locked decisions
  from user-memory `opsx-package-extraction-open-questions` —
  npm scope `@usertesting/`, package name `insight-out-opsx`
  (working name), UT private org registry, `opsx init` performs
  full bootstrap, Codex placement stays global — without
  paraphrase-induced rewording of the core claims

#### Scenario: Bin section names both subcommands and the openspec preflight
- **WHEN** a viewer reaches the bin section
- **THEN** the slides SHALL name both `opsx init` and `opsx sync`
  as subcommands of one bin AND SHALL state that `openspec` is a
  hard peer dependency that must be installed first; ONE slide in
  this section SHALL use a `diff` content item showing a
  before/after of `opsx init` on a fresh consumer repo

#### Scenario: Drift section names both CI surfaces
- **WHEN** a viewer reaches the drift section
- **THEN** at least one slide SHALL state that drift enforcement
  runs in two places — the package repo (against fixtures) and
  every consumer repo (against its own tree) — AND SHALL surface
  the Codex-global CI scope gap so it does not go silent

#### Scenario: Adoption section names openspec-llm as the first consumer
- **WHEN** a viewer reaches the adoption section
- **THEN** at least one slide SHALL state that `openspec-llm` is
  the package's first consumer (dogfooded before any external
  adopter) AND name the one-line install + init flow available to
  any external UT repo

#### Scenario: Close slide cites the foundational mitigations
- **WHEN** a viewer reaches the final slide
- **THEN** the slide SHALL include `link` content items pointing at
  the archived `single-source-opsx-templates` and
  `tool-agnostic-opsx-templates` changes — those are the
  foundation the extraction builds on, and the deck's audit
  trail terminates there

### Requirement: Load-bearing claims SHALL cite a memory record or an archived change

Every slide asserting a locked decision, a peer-dep requirement, a versioning class, or a codex-placement rule SHALL include a citation to its source in either a body `callout` of tone `evidence` or in the slide's `notes` field. The accepted sources are exactly: user-memory record `opsx-package-extraction-open-questions`, user-memory record `codex-placement-matches-upstream`, or an archived change directory under `openspec/changes/archive/RAD-75634/`.

Slides presenting forward-looking shape without a specific locked-decision claim (the title slide, the problem-statement slide, the close-slide framing) are exempt from the citation requirement but SHALL NOT invent numbers, timelines, or claims that cannot be sourced to one of the accepted sources.

#### Scenario: Slide quotes a locked decision
- **WHEN** a slide states one of the five locked decisions verbatim
- **THEN** its `notes` or a body `callout` SHALL name
  `opsx-package-extraction-open-questions` as the source

#### Scenario: Slide projects an unsourced number or timeline
- **WHEN** a slide includes a figure (e.g., "shipping in Q3", "12
  consumer repos lined up") that cannot be sourced to memory or an
  archived change
- **THEN** that slide SHALL be rejected at review time; the figure
  SHALL either be removed or replaced with a structural fact (e.g.,
  "11 canonical templates" is sourced; "Q3" is not)

### Requirement: Deck SHALL declare its own theme module

The deck's visual treatment SHALL live at
`apps/presentation/src/decks/package-extraction/theme.ts` as a
`Theme` export whose `name` field is `'package-extraction'`. The
theme SHALL reuse the existing brand palette tokens (`ut-navy`,
`ut-navy-dark`, `ut-blue`, `ut-teal`) — no new brand colors SHALL be
introduced. The accent treatment SHALL be visually distinguishable
from both the workflow deck (gradient stripe) and the research deck
(hand-drawn stroke); the chosen treatment is a solid `ut-teal` bar.

#### Scenario: Deck renders with its own theme
- **WHEN** the deck renders at `/#/package-extraction`
- **THEN** the deck SHALL visibly differ from the workflow and
  research decks in accent style AND SHALL preserve the
  UserTesting logo (same asset, same opacity, same placement)
  and the `ut-*` palette tokens

#### Scenario: New brand color is introduced
- **WHEN** a contributor proposes a hex value outside the `ut-*`
  palette tokens
- **THEN** the proposal SHALL be rejected; theme decisions MUST
  draw from the existing palette

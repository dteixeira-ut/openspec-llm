## ADDED Requirements

### Requirement: Presentation app SHALL support hash-based client-side routing

The presentation app SHALL route between three top-level destinations using `window.location.hash`: a landing page at `/` (no hash), the workflow deck at `/#/workflow`, and the research deck at `/#/research`. The research deck SHALL further accept `/#/research/summary` as a density variant.

#### Scenario: Direct navigation to workflow deck
- **WHEN** a user opens the site at `/#/workflow`
- **THEN** the app SHALL render the existing workflow deck (the slide content currently at `src/slides.ts`) without any visual or behavioral change

#### Scenario: Direct navigation to research deck
- **WHEN** a user opens the site at `/#/research`
- **THEN** the app SHALL render the new research deck with full-density slides

#### Scenario: Direct navigation to research summary
- **WHEN** a user opens the site at `/#/research/summary`
- **THEN** the app SHALL render the research deck with only slides marked `density: 'summary'` or `density: 'both'`

#### Scenario: Root path renders the landing page
- **WHEN** a user opens the site at `/` or any unrecognized hash
- **THEN** the app SHALL render the landing page linking to both decks

### Requirement: Presentation app SHALL render a landing page

The landing page SHALL list both decks as cards with a one-line description each, plus a short framing paragraph. The Research card SHALL include a secondary link to the summary route.

#### Scenario: Landing page lists both decks
- **WHEN** the landing page renders
- **THEN** it SHALL include a card linking to `/#/workflow` titled "OpenSpec + Claude Workflow" with a one-line description, AND a card linking to `/#/research` titled "Migration Case Study" (or equivalent) with a one-line description and a secondary "View summary" link to `/#/research/summary`

#### Scenario: Landing uses workflow-deck theming
- **WHEN** the landing page renders
- **THEN** it SHALL use the same stage background, card style, and watermark treatment as the workflow deck so the brand entry point feels continuous with the existing experience

### Requirement: Slide schema SHALL be extended with research-content variants

The `ContentItem` union in `src/types.ts` SHALL gain new variants without removing or changing existing variants: `finding`, `timeline`, `diff`, `metric`, `callout`.

`finding` MUST include `severity: 'low' | 'medium' | 'high'`, `title: string`, `body: string`, and an optional `mitigation: { changeName: string; href: string }`.

`timeline` MUST include `items: { date: string; event: string }[]`.

`diff` MUST include `before: string`, `after: string`, and optional `language?: string`.

`metric` MUST include `label: string`, `value: string`, and optional `subtext?: string`.

`callout` MUST include `tone: 'info' | 'warn' | 'evidence'` and `content: string`.

#### Scenario: Existing workflow slides remain valid
- **WHEN** the workflow deck renders after the schema extension
- **THEN** every existing slide SHALL render identically to its pre-change appearance (the extension is additive only)

#### Scenario: Research deck uses new variants
- **WHEN** the research deck renders a slide containing a `finding` content item with `mitigation` populated
- **THEN** the slide SHALL display the finding with severity-styled treatment AND a link to the named mitigation change

### Requirement: Deck content SHALL be loaded from per-deck slide modules

Slide data SHALL live under `apps/presentation/src/decks/<deck-name>/slides.ts`. The workflow deck's slides SHALL move from `src/slides.ts` to `src/decks/workflow/slides.ts` byte-for-byte (only the import path changes for consumers).

#### Scenario: Workflow content move preserves bytes
- **WHEN** the workflow deck's `slides.ts` is moved to the new location
- **THEN** the slide content SHALL be identical to the pre-move file; the only diff between the old and new files SHALL be unrelated to slide content (imports, file location)

#### Scenario: Research deck has its own slides module
- **WHEN** a developer opens `src/decks/research/slides.ts`
- **THEN** they SHALL find the research deck's slide array; the workflow deck's slides SHALL NOT appear in this file

### Requirement: Decks SHALL be themable via per-deck theme config

Each deck SHALL declare a theme config at `apps/presentation/src/decks/<deck-name>/theme.ts` describing stage background, slide-card style, accent treatment, and animation overrides. Slide-renderer components SHALL read brand tokens and visual choices from the theme rather than hardcoding them.

#### Scenario: Workflow theme matches current rendering
- **WHEN** the workflow deck renders with its theme applied
- **THEN** the visual output SHALL match the pre-change rendering exactly (no regression on the existing deck)

#### Scenario: Research theme produces a distinct visual treatment
- **WHEN** the research deck renders with its theme applied
- **THEN** the deck SHALL visibly differ from the workflow deck in slide-card shape, stage background texture, and accent style — while preserving the UserTesting logo (same asset, same opacity, same placement) and the `ut-navy` / `ut-blue` / `ut-teal` palette tokens (no new brand colors introduced)

### Requirement: Density selection SHALL filter the research deck's slides

A density flag on each research-deck slide (`density: 'full' | 'summary' | 'both'`) SHALL drive which slides render at each route.

#### Scenario: Summary route renders summary and both
- **WHEN** the deck is loaded at `/#/research/summary`
- **THEN** only slides with `density: 'summary'` or `density: 'both'` SHALL be in the rendered slide list, in their declared order

#### Scenario: Full route renders full and both
- **WHEN** the deck is loaded at `/#/research`
- **THEN** only slides with `density: 'full'` or `density: 'both'` SHALL be in the rendered slide list, in their declared order

#### Scenario: Density defaults
- **WHEN** a slide in `src/decks/research/slides.ts` omits the `density` field
- **THEN** the TypeScript compiler SHALL flag it as missing (the field is required on research-deck slides; the workflow deck's slides do not carry a density field)

### Requirement: Routing implementation SHALL not introduce new runtime dependencies

The routing implementation SHALL use only React 19 and the browser's `hashchange` event. No new packages SHALL be added to `apps/presentation/package.json` `dependencies` for routing.

#### Scenario: Dependency footprint unchanged
- **WHEN** the change is merged
- **THEN** `apps/presentation/package.json` `dependencies` SHALL contain only `react` and `react-dom` at the same major versions as before

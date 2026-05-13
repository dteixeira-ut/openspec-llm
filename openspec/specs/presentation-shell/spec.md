## Purpose

This capability defines the presentation app's shell — slide navigation, keyboard shortcuts, speaker-notes toggle, progress indicator, and the surrounding chrome that hosts deck content rendered from the slide modules.
## Requirements
### Requirement: Slide navigation
The app SHALL display one slide at a time and allow the user to move forward and backward through the slide deck.

#### Scenario: Advance to next slide via button
- **WHEN** the user clicks the "Next" button
- **THEN** the app displays the next slide in sequence

#### Scenario: Advance to next slide via keyboard
- **WHEN** the user presses ArrowRight or the `l` key
- **THEN** the app displays the next slide in sequence

#### Scenario: Go back to previous slide via button
- **WHEN** the user clicks the "Previous" button
- **THEN** the app displays the previous slide in sequence

#### Scenario: Go back to previous slide via keyboard
- **WHEN** the user presses ArrowLeft or the `h` key
- **THEN** the app displays the previous slide in sequence

#### Scenario: Navigation is bounded
- **WHEN** the user is on the first slide and attempts to go back
- **THEN** the Previous button is disabled and no navigation occurs

#### Scenario: Navigation is bounded at end
- **WHEN** the user is on the last slide and attempts to advance
- **THEN** the Next button is disabled and no navigation occurs

### Requirement: Progress indicator
The app SHALL display the current slide number and total slide count so the user knows their position in the deck.

#### Scenario: Progress indicator reflects current position
- **WHEN** a slide is displayed
- **THEN** the progress indicator shows `<current> / <total>` (e.g., "3 / 12")

### Requirement: Visual design matches UserTesting.com aesthetic
The app SHALL use a visual style consistent with usertesting.com: deep purple primary color, white/light-gray backgrounds, bold sans-serif typography (Inter or equivalent), generous whitespace, and subtle card-style slide containers.

#### Scenario: Primary color is deep purple
- **WHEN** any interactive element (button, progress indicator, active state) is rendered
- **THEN** it uses the deep purple primary color (`#6B3FA0` or equivalent from the design token)

#### Scenario: Typography is clean and sans-serif
- **WHEN** any text is rendered
- **THEN** it uses Inter or a comparable geometric sans-serif at legible sizes

#### Scenario: Slides render in a card container
- **WHEN** a slide is displayed
- **THEN** it is rendered inside a white or light-gray card with subtle box-shadow, centered on a slightly darker background

### Requirement: Responsive layout
The app SHALL be usable on both desktop (1280px+) and tablet (768px+) viewports.

#### Scenario: Desktop layout fills available width
- **WHEN** viewed on a 1280px or wider viewport
- **THEN** the slide card uses a comfortable max-width with centered horizontal alignment

#### Scenario: Tablet layout adapts without overflow
- **WHEN** viewed on a 768px wide viewport
- **THEN** all text and navigation controls remain visible without horizontal scrolling

### Requirement: Accessible keyboard and ARIA
The slide region SHALL be accessible to screen readers and keyboard-only users.

#### Scenario: Slide region has accessible role
- **WHEN** a slide is rendered
- **THEN** the slide container has `role="region"` and `aria-label` describing the current slide title

#### Scenario: Navigation buttons have accessible labels
- **WHEN** Previous or Next buttons are rendered
- **THEN** each has an `aria-label` and is focusable via Tab

### Requirement: Presentation app SHALL support hash-based client-side routing

The presentation app SHALL route between four top-level destinations using `window.location.hash`: a landing page at `/` (no hash), the workflow deck at `/#/workflow`, the research deck at `/#/research`, and the package-extraction deck at `/#/package-extraction`. The research deck SHALL further accept `/#/research/summary` as a density variant. The package-extraction deck SHALL NOT accept a density variant — it renders at one length only.

#### Scenario: Direct navigation to workflow deck
- **WHEN** a user opens the site at `/#/workflow`
- **THEN** the app SHALL render the existing workflow deck (the slide content currently at `src/decks/workflow/slides.ts`) without any visual or behavioral change

#### Scenario: Direct navigation to research deck
- **WHEN** a user opens the site at `/#/research`
- **THEN** the app SHALL render the research deck with full-density slides

#### Scenario: Direct navigation to research summary
- **WHEN** a user opens the site at `/#/research/summary`
- **THEN** the app SHALL render the research deck with only slides marked `density: 'summary'` or `density: 'both'`

#### Scenario: Direct navigation to package-extraction deck
- **WHEN** a user opens the site at `/#/package-extraction`
- **THEN** the app SHALL render the package-extraction deck using its own theme and the slide content from `src/decks/package-extraction/slides.ts`

#### Scenario: Package-extraction summary route does not exist
- **WHEN** a user opens the site at `/#/package-extraction/summary` or any unrecognized sub-path under `package-extraction`
- **THEN** the app SHALL fall through to the landing page (same fallback behavior as other unrecognized hashes)

#### Scenario: Root path renders the landing page
- **WHEN** a user opens the site at `/` or any unrecognized hash
- **THEN** the app SHALL render the landing page linking to all three decks

### Requirement: Presentation app SHALL render a landing page

The landing page SHALL list all three decks as cards with a one-line description each, plus a short framing paragraph. The Research card SHALL include a secondary link to the summary route. Card order from left to right SHALL be: workflow, research, package-extraction. The framing paragraph SHALL refer to "three decks" (not "two decks"); the workflow and research cards' content SHALL remain byte-for-byte identical to the pre-change versions apart from any grid-class change needed for the three-card layout.

#### Scenario: Landing page lists all three decks
- **WHEN** the landing page renders
- **THEN** it SHALL include three cards in order — `/#/workflow` titled "OpenSpec + Claude Workflow", `/#/research` titled "Migration Case Study" (with a secondary "View summary" link to `/#/research/summary`), and `/#/package-extraction` titled with a name that names the package-extraction work (e.g., "Package Extraction" or equivalent) — each with a one-line description

#### Scenario: Landing card layout is three-abreast at md breakpoint
- **WHEN** the landing page renders at viewport widths at or above the Tailwind `md` breakpoint
- **THEN** the three cards SHALL render side-by-side in a single row; at narrower widths the cards SHALL stack single-column

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

The `Theme.name` field SHALL be a string-literal union containing exactly one entry per shipped deck. At time of this requirement's last update, the union is `'workflow' | 'research' | 'package-extraction'`. Adding a new deck SHALL extend this union as part of the deck's own change.

#### Scenario: Workflow theme matches current rendering
- **WHEN** the workflow deck renders with its theme applied
- **THEN** the visual output SHALL match the pre-change rendering exactly (no regression on the existing deck)

#### Scenario: Research theme produces a distinct visual treatment
- **WHEN** the research deck renders with its theme applied
- **THEN** the deck SHALL visibly differ from the workflow deck in slide-card shape, stage background texture, and accent style — while preserving the UserTesting logo (same asset, same opacity, same placement) and the `ut-navy` / `ut-blue` / `ut-teal` palette tokens (no new brand colors introduced)

#### Scenario: Package-extraction theme produces a third distinct treatment
- **WHEN** the package-extraction deck renders with its theme applied
- **THEN** the deck SHALL visibly differ from both the workflow deck (gradient stripe accent) and the research deck (hand-drawn stroke accent) — the package-extraction accent SHALL be a solid `ut-teal` bar — while preserving the UserTesting logo and the existing `ut-*` palette tokens (no new brand colors introduced)

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


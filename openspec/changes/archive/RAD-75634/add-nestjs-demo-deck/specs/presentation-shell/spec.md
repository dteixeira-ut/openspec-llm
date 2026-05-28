## MODIFIED Requirements

### Requirement: Presentation app SHALL support hash-based client-side routing

The presentation app SHALL route between five top-level destinations using `window.location.hash`: a landing page at `/` (no hash), the workflow deck at `/#/workflow`, the research deck at `/#/research`, the package-extraction deck at `/#/package-extraction`, and the nestjs-demo deck at `/#/nestjs-demo`. The research deck SHALL further accept `/#/research/summary` as a density variant. The package-extraction and nestjs-demo decks SHALL NOT accept a density variant — they each render at one length only.

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

#### Scenario: Direct navigation to nestjs-demo deck
- **WHEN** a user opens the site at `/#/nestjs-demo`
- **THEN** the app SHALL render the nestjs-demo deck using `nestjsDemoTheme` and the slide content from `src/decks/nestjs-demo/slides.ts`

#### Scenario: Package-extraction summary route does not exist
- **WHEN** a user opens the site at `/#/package-extraction/summary` or any unrecognized sub-path under `package-extraction`
- **THEN** the app SHALL fall through to the landing page (same fallback behavior as other unrecognized hashes)

#### Scenario: Nestjs-demo summary route does not exist
- **WHEN** a user opens the site at `/#/nestjs-demo/summary` or any unrecognized sub-path under `nestjs-demo`
- **THEN** the app SHALL fall through to the landing page (same fallback behavior as other unrecognized hashes)

#### Scenario: Root path renders the landing page
- **WHEN** a user opens the site at `/` or any unrecognized hash
- **THEN** the app SHALL render the landing page linking to all four decks

### Requirement: Presentation app SHALL render a landing page

The landing page SHALL list all four decks as cards with a one-line description each, plus a short framing paragraph. The Research card SHALL include a secondary link to the summary route. Card order from left to right (then top to bottom on narrower viewports) SHALL be: workflow, research, package-extraction, nestjs-demo. The framing paragraph SHALL refer to "four decks" (not "three decks"); the workflow, research, and package-extraction cards' content SHALL remain byte-for-byte identical to the pre-change versions apart from the grid-class change needed for the four-card layout.

#### Scenario: Landing page lists all four decks
- **WHEN** the landing page renders
- **THEN** it SHALL include four cards in order — `/#/workflow` titled "OpenSpec + Claude Workflow", `/#/research` titled "Migration Case Study" (with a secondary "View summary" link to `/#/research/summary`), `/#/package-extraction` titled with a name that names the package-extraction work, and `/#/nestjs-demo` titled with a name that names the migrate-to-nestjs skill walkthrough (e.g., "Migrate to NestJS" or equivalent) — each with a one-line description

#### Scenario: Landing card layout uses 2-up at md, 4-up at lg
- **WHEN** the landing page renders at viewport widths at or above the Tailwind `md` breakpoint and below `lg`
- **THEN** the four cards SHALL render in a 2×2 grid (`md:grid-cols-2`); at viewport widths at or above the `lg` breakpoint the four cards SHALL render in a single row (`lg:grid-cols-4`); at widths narrower than `md` the cards SHALL stack single-column

#### Scenario: Landing uses workflow-deck theming
- **WHEN** the landing page renders
- **THEN** it SHALL use the same stage background, card style, and watermark treatment as the workflow deck so the brand entry point feels continuous with the existing experience

### Requirement: Decks SHALL be themable via per-deck theme config

Each deck SHALL declare a theme config at `apps/presentation/src/decks/<deck-name>/theme.ts` describing stage background, slide-card style, accent treatment, and animation overrides. Slide-renderer components SHALL read brand tokens and visual choices from the theme rather than hardcoding them.

The `Theme.name` field SHALL be a string-literal union containing exactly one entry per shipped deck. At time of this requirement's last update, the union is `'workflow' | 'research' | 'package-extraction' | 'nestjs-demo'`. Adding a new deck SHALL extend this union as part of the deck's own change.

#### Scenario: Workflow theme matches current rendering
- **WHEN** the workflow deck renders with its theme applied
- **THEN** the visual output SHALL match the pre-change rendering exactly (no regression on the existing deck)

#### Scenario: Research theme produces a distinct visual treatment
- **WHEN** the research deck renders with its theme applied
- **THEN** the deck SHALL visibly differ from the workflow deck in slide-card shape, stage background texture, and accent style — while preserving the UserTesting logo (same asset, same opacity, same placement) and the `ut-navy` / `ut-blue` / `ut-teal` palette tokens (no new brand colors introduced)

#### Scenario: Package-extraction theme produces a third distinct treatment
- **WHEN** the package-extraction deck renders with its theme applied
- **THEN** the deck SHALL visibly differ from both the workflow deck (gradient stripe accent) and the research deck (hand-drawn stroke accent) — the package-extraction accent SHALL be a solid `ut-teal` bar — while preserving the UserTesting logo and the existing `ut-*` palette tokens (no new brand colors introduced)

#### Scenario: Nestjs-demo theme produces a fourth distinct treatment
- **WHEN** the nestjs-demo deck renders with its theme applied
- **THEN** the deck SHALL visibly differ from all three other decks — the nestjs-demo accent SHALL be a solid `ut-navy` bar (distinct from workflow's gradient, research's hand-drawn stroke, and package-extraction's solid `ut-teal`) — while preserving the UserTesting logo and the existing `ut-*` palette tokens (no new brand colors introduced)

## Precedence note

On brownfield changes, when scenario wording in this spec conflicts with a directive to "preserve legacy behavior byte-for-byte" in `proposal.md`'s `## Legacy preservation` section, the legacy preservation directive is authoritative. The four existing decks (workflow, research with full + summary, package-extraction) MUST continue to render identically; any scenario above that would imply otherwise is to be read as additive, not replacing.

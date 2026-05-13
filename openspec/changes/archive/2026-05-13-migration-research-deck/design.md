## Context

The existing presentation at `apps/presentation/` is a single-deck Vite + React 19 app rendering a slide array from `src/slides.ts` (491 lines, ~30 slides) into `SlideCard` components, with `NavControls`, `NotesPanel`, and `ProgressIndicator` chrome. It's served as a static `dist/` bundle; no router, no routing concerns today.

The existing deck's visual identity:
- Dark navy stage (`bg-ut-navy-dark`) with subtle stage-glow effect
- White slide-card with a navy→blue→teal gradient accent bar
- UserTesting logo as a low-opacity watermark
- Fade-up entrance animations per item, staggered by index
- `font-sans` for prose, `font-mono` for skill-name titles
- Tailwind utility classes throughout; brand tokens via `tailwind.config.ts` (`ut-navy`, `ut-blue`, `ut-teal`, etc.)

The research story comes from the `enriched-video-uploads-v2` repo's `openspec/research/sdd-exploration-notes.md` (~420 lines) plus the artifacts of `harden-opsx-workflow` and `add-domain-skills` (the two changes just shipped). The findings fall into clear classes:
1. Implicit deployment context wasn't surfaced
2. Spec-vs-reality drifts (silent agent decisions)
3. Delivery shape was designed in conversation, not captured in artifacts
4. Configuration drift across sibling services
5. Auxiliary infra files not updated when source changed

Each finding has a concrete artifact-level mitigation in the two new changes.

## Goals / Non-Goals

**Goals:**

- Give the workflow pitch and the case study independent URLs so each can be linked, shared, and presented standalone.
- Establish a slide-data and theming pattern that scales to a third or fourth deck without re-architecting (e.g. a future per-team case study, or a deck about the `migrate-to-nestjs` skill).
- Preserve the existing workflow deck exactly as it renders today — same URL behavior under bookmarks (handled via redirect from `/`), same look, same slides.
- Make the density toggle for the research deck feel intentional (clearly different audiences, not "same deck with less"), via slide selection AND a small visual treatment difference (compact card variant for the summary route).

**Non-Goals:**

- Building a generic deck framework or CMS for slide content. Slides stay as TS data; new decks are new TS files.
- Server-side routing or SSR. The site is static.
- Speaker-mode features beyond the existing notes panel (no presenter view, no remote control).
- Print/PDF export.
- Search across decks.
- Analytics or telemetry on which slides are viewed.

## Decisions

### Decision 1: Hash-based routing, implemented inline in `App.tsx`

Routes:
- `/` — landing page (two cards linking to the two decks)
- `/#/workflow` — existing deck (no slide content changes)
- `/#/research` — new research deck, full density
- `/#/research/summary` — new research deck, summary density

Implementation: a small `useHashRoute()` hook listening to `hashchange`, returning `{ deck: 'workflow' | 'research' | 'landing', density: 'full' | 'summary' }`. `App.tsx` switches on the deck and renders the appropriate component tree. Total routing code: under 50 LOC.

Chosen over: `react-router-dom` (dependency weight not justified for three routes), History-API path routing (requires static-host rewrite rules; hash routing works on any host).

Trade-off: hash-routed URLs are slightly less pretty (`/#/research` vs `/research`). Accepted because the team has not signalled the need for pretty URLs and the deploy simplicity is worth it.

### Decision 2: Two decks live as separate slide files under `apps/presentation/src/decks/`

Folder layout:

```
src/
  decks/
    workflow/
      slides.ts         # moved from src/slides.ts, content unchanged
      theme.ts          # current visual treatment, extracted into a config
    research/
      slides.ts         # new research-deck content
      theme.ts          # new "research journal" visual treatment
  components/
    SlideCard.tsx       # accepts theme as prop; existing layout becomes the 'workflow' theme variant
    ResearchSlideCard.tsx  # OR a theme-variant branch inside SlideCard.tsx — design phase decides
    LandingPage.tsx     # NEW
  hooks/
    useHashRoute.ts     # NEW
  types.ts              # extended with new content types
```

Chosen over: keeping `slides.ts` at `src/` root with a discriminator (cramps as decks grow); subdirectory-per-deck inside `src/decks/<name>/` with both content and components (couples deck data to deck components, making theme reuse harder).

### Decision 3: Density is a per-slide flag, single source of truth

Each slide in `decks/research/slides.ts` declares `density: 'full' | 'summary' | 'both'`. The summary deck renders only slides with `density: 'summary' | 'both'`; the full deck renders only `density: 'full' | 'both'`. Most slides will be `'both'` (~12 core slides shared); summary-only slides are highly-condensed framings, full-only slides are deep dives.

Chosen over: two parallel slide arrays (drift risk); a generator script that produces a summary deck from full slides (would force every slide to be summary-shrinkable, which the long-form findings aren't).

### Decision 4: Visual treatment for the research deck — "research journal" aesthetic, same brand tokens

The brief is "same logo and colors but different." Concrete plan:

| Element | Workflow deck (existing) | Research deck (new) |
|---|---|---|
| Stage | Solid navy with glow | Same brand colors, but with a subtle paper-grain texture (CSS-only, no asset) and a faint grid overlay |
| Slide card | White, glossy, rounded-2xl, shadow-2xl | Off-white (`#fafaf8`), squarer corners (`rounded-lg`), softer shadow, deckled-edge top border instead of gradient bar |
| Accent bar | Gradient navy→blue→teal | Hand-drawn-look horizontal stroke in `ut-blue`, slightly off-axis |
| Heading font | Sans-serif (current) | Same sans-serif but smaller scale; section markers in monospace |
| Body type | Gray-700 prose | Same brand colors, but slightly higher leading; bullets get a "checkbox-after-the-fact" feel for findings (open / resolved / partial) |
| Animation | Fade-up staggered | Same fade-up but slower; finding cards get a "page-flip" entrance (CSS only) |
| Watermark | UserTesting logo at low opacity (bottom) | Same logo, same placement, same opacity — explicit brand continuity |
| Color palette | `ut-navy`, `ut-blue`, `ut-teal` | Same tokens; no new brand colors |

The "research journal" feel evokes a lab notebook or report rather than a marketing pitch. It signals "this is evidence, not a sell." Same brand, different communication intent.

Chosen over: more dramatic redesigns (different font family, different palette) — rejected because the user explicitly asked for same logo and colors. Subtler changes (only the slide-card border) — rejected because the brief was "different," not "barely different."

### Decision 5: Extended slide schema, additive only

`types.ts` extends `ContentItem` with new variants:

```ts
| { type: 'finding'; severity: 'low' | 'medium' | 'high'; title: string; body: string; mitigation?: { changeName: string; href: string } }
| { type: 'timeline'; items: { date: string; event: string; }[] }
| { type: 'diff'; before: string; after: string; language?: string }
| { type: 'metric'; label: string; value: string; subtext?: string }
| { type: 'callout'; tone: 'info' | 'warn' | 'evidence'; content: string }
```

Existing `ContentItem` variants remain valid; the workflow deck's slides need no changes.

### Decision 6: Landing page is a minimal card-list, not a slide

`LandingPage.tsx` renders two cards (Workflow, Research) with one-line descriptions and links. Below the cards: a short paragraph framing the experiment ("Built with the workflow it pitches. Read the case study to see the evidence."). The landing page uses the workflow deck's visual treatment (stage glow, white cards) so the brand entry point feels consistent with the existing deck.

A small "Summary view" link appears under the Research card pointing at `/#/research/summary`.

Chosen over: rendering the landing as a slide-shaped deck of length 1 (would imply navigation patterns); a redirect to `/#/workflow` (hides the second deck's existence).

### Decision 7: The research deck's narrative arc

The full deck (~24 slides) is structured as:

1. **Frame** (3 slides): the experiment, the consuming repo, what was measured.
2. **Process** (4 slides): how the migration was driven by `/opsx:*`, the stacked-PR delivery shape, the per-capability slicing.
3. **Findings — by class** (~9 slides): two slides per finding class (overview + concrete example) where the example is structurally distinct, otherwise one slide with the example embedded inline. Classes:
   - Implicit deployment context (Gap 1, ConfigMap mount drift)
   - Silent agent decisions (`INVALID_ARGUMENT` vs `FAILED_PRECONDITION`, `logAction(CREATED)` vs legacy)
   - Delivery shape gaps (Gap 10 + squash×stacked rebase cost)
   - Configuration drift (.prettierrc decorators-legacy, Dockerfile entry point)
   - Library-vs-spec mismatch (Kafka `Producer.disconnect()`)
4. **Mitigations shipped** (4 slides): `harden-opsx-workflow` (the rules + `/opsx:plan` + silent-decisions marker) and `add-domain-skills` (the two repo-agnostic skills), with embedded artifact snippets.
5. **Learnings** (3 slides): what SDD does well in practice; what it doesn't catch by construction; the must-ask vs may-decide framing as a transferable lesson.
6. **Close** (1 slide): the dogfooding loop closed — this very deck was built using the workflow.

The summary deck (~14 slides) cuts: half of the per-class findings (one slide per class instead of two), drops the embedded artifact diffs, condenses Learnings into one slide. The narrative arc remains intact.

**Note**: an earlier draft of this design included a seventh "What's next" section (concrete follow-ups, open questions for the team, domain-skill graduation). Removed during implementation on user direction so the deck ends on Learnings → Close. Follow-up work is captured in the OpenSpec change archive and tracked separately from the case-study record.

### Decision 8: References to external artifacts use absolute URLs

The deck references files in `enriched-video-uploads-v2` (the research notes, specific commit SHAs) and the two new changes in this repo. All references are absolute GitHub URLs (e.g. `https://github.com/dteixeira-ut/openspec-claude/blob/main/...`) so the deck is portable across deploy contexts.

Chosen over: relative paths (don't work in a deployed static site); embedded copies of the source files (drift risk).

### Decision 9: This change does NOT touch the workflow deck's content

The existing slides move from `src/slides.ts` to `src/decks/workflow/slides.ts` byte-for-byte. No content edits. The risk of unintended edits during the move is mitigated by an explicit lint-level grep: the post-move file must equal the pre-move file with the import path rewritten only.

## Risks / Trade-offs

- **Hash-routing collides with anchor-style intra-page navigation in the future** → mitigate by reserving `/#/` as the route prefix; intra-page anchors would use `/#/research#some-id`. The hook treats only the second-level path as a route.
- **The research deck's content drifts from the research notes in the sibling repo** → accept for v1. The deck cites the notes as the source of truth; significant changes to the notes trigger a deck refresh as a future change.
- **Theme split increases the surface area to maintain** → mitigate by extracting a `Theme` type with a small number of slots (stage, card, accent, animation), and validating that every slide-content-type renderer reads from the theme rather than hardcoding brand tokens.
- **Density toggle reads as "less is more bullets" if execution is sloppy** → mitigate by selecting summary slides at design time (not by mechanical truncation), and applying a tighter card variant so the visual signals "summary" without saying so.
- **The `presentation-content` capability is reused for one deck and a new capability is created for the other — asymmetric naming** → accept. Renaming an archived/living capability is high friction (Decision 6 in proposal). A future change can rename for symmetry if the asymmetry becomes confusing.
- **Embedded artifact snippets become stale if `harden-opsx-workflow` or `add-domain-skills` change post-merge** → accept. The deck is an evidence artifact, not a live mirror. A periodic refresh (annotated as such) is acceptable.
- **The deck makes claims about migration outcomes (`~22 sub-PRs`, `~18 rebase cycles`, time percentages)** → cite the research notes' counts inline so claims are auditable. Do not introduce new numbers that aren't in the source notes.
- **Brand-continuity vs visual-distinction tension** → resolved by Decision 4's tabled comparison. If the user reviews the design and the research deck doesn't feel different enough, the next adjustment is on the typography scale and the slide-card shape (still no new brand colors).

## Context

The presentation app's deck model is already pluralized: each deck
lives at `apps/presentation/src/decks/<name>/` with its own
`slides.ts` and `theme.ts`, gets a hash route in
`hooks/useHashRoute.ts`, and is rendered via a conditional branch in
`App.tsx`. The shell capability (`presentation-shell`) names the
existing three destinations (landing, workflow, research) explicitly.
Adding a fourth destination is a surgical extension — three small
edits to existing files plus a new deck directory and its content.

The deck pitches the package extraction phase (extracting
`templates/opsx/` + `bin/opsx-sync` into `@usertesting/insight-out-opsx`).
The locked decisions for that work live in user-memory
`opsx-package-extraction-open-questions` and are the substrate for
the deck's content: scope `@usertesting/`, package name
`insight-out-opsx` (working), private UT org registry, full-bootstrap
`opsx init`, Codex stays global per
`codex-placement-matches-upstream`, peer-dep on `openspec` is hard.

The deck is forward-looking (the work has not shipped yet), which
shapes the tone: this is a pitch with a "what we're about to do and
why" arc, not a case study with measurements.

## Goals / Non-Goals

**Goals:**
- Slot a third deck into the existing shell with minimal disruption.
- Preserve the existing two decks byte-for-byte and route-for-route.
- Anchor every load-bearing claim in the deck to either the
  memory-locked decisions or the archived RAD-75634 mitigations.
- Land at ~10–14 slides total — short enough to read in one sitting,
  long enough to cover the seven content areas from proposal.md.
- Reuse the existing slide content-item types (`text`, `bullets`,
  `callout`, `diff`, `link`, `subheading`, `code`) — no new content
  variants.

**Non-Goals:**
- Authoring the package itself.
- Adding a density-variant route (no summary deck — this one is
  small enough to read straight through).
- Restyling the existing decks.
- Adding a `finding`-style content item (those are research-deck
  specific and inappropriate for a forward-looking pitch).
- Adding a fourth deck on the landing page in any role other than
  "third card after workflow and research."

## Decisions

### 1. Narrative arc — five sections, 10–14 slides

1. **Frame (1–2 slides)**: title + problem statement (why packaging
   matters once one source of truth exists in one repo).
2. **Locked decisions (2–3 slides)**: scope, name, registry, init
   shape, codex placement — pulled verbatim from memory.
3. **The bin (2–3 slides)**: `opsx init` (full bootstrap) and
   `opsx sync` (the existing fan-out, repackaged). One diff slide
   showing init's before/after on a fresh repo.
4. **Drift (1 slide)**: the two-layer CI gate (package repo
   fixtures + consumer-repo install) and the Codex-global scope
   gap. Versioning policy is deliberately omitted — semver is
   industry-standard and a primer would pad the deck without
   teaching the audience anything new.
5. **Adoption (1–2 slides)**: what changes for openspec-llm itself
   (becomes the first consumer); what changes for external UT
   repos (one-line install + init).
6. **Close (1 slide)**: link to the relevant archives in this repo
   (`single-source-opsx-templates`, `tool-agnostic-opsx-templates`)
   as the foundation the package builds on.

Slide-count bound: 10–14, target 12. No density variant; the deck
renders at one length only.

### 2. Theme — distinct visual treatment, same brand tokens

The new deck SHALL be visually distinct from both workflow and
research so audiences switching between them feel the section
boundary. Visual choices:
- **Accent**: a thin solid bar (not gradient like workflow, not
  hand-drawn stroke like research) in `ut-teal` — keeps the
  palette in-family.
- **Card shape**: slightly rounder than workflow (rounded-2xl vs
  rounded-xl), with a tighter padding rhythm than research.
- **Stage background**: same `bg-ut-navy-dark` as workflow with the
  `stage-glow` overlay. Research's textured background stays
  research-only.

The `Theme.name` union extends to `'package-extraction'`. The
`SlideCard.tsx` background-color branch (currently
`theme.name === 'research'`) is left untouched — the new deck uses
the default card background, no per-deck override.

**Alternative considered:** invent a fully new color (e.g.,
`ut-amber`). Rejected — proposal forbids new brand colors. The
`ut-teal` token is already in the palette and is the freshest of
the three.

### 3. Routing extension

`hooks/useHashRoute.ts`:
- `Deck` union extends to `'workflow' | 'research' | 'landing' | 'package-extraction'`.
- The parser gains a branch: `if (first === 'package-extraction') return { deck: 'package-extraction', density: 'full' }`.
- No density variant — the route does not accept `/summary`.

`App.tsx`:
- A new conditional branch renders `<DeckView slides={packageExtractionSlides} theme={packageExtractionTheme} />`.
- The research-deck density filter is left untouched.

### 4. Landing-page extension

The existing two-card grid is preserved exactly. A third card is
appended. To keep the grid responsive without rewriting the layout,
the `md:grid-cols-2` becomes `md:grid-cols-3` at the wider breakpoint
and stays single-column at narrow widths. The framing copy is
updated from "Two decks. One workflow." to "Three decks. One
workflow." and the paragraph below names the third deck in one
sentence.

The third card uses the same `rounded-2xl bg-white shadow-2xl`
shape as the workflow card (workflow shape, not research) so the
visual weight on the landing page reads as "two decks of one
kind, one of another" rather than introducing a third card style.

**Alternative considered:** put the new card in a second row
beneath the existing two. Rejected — the visual hierarchy reads as
"three peers" cleanly when they're side-by-side at wider widths.

### 5. Slide content sourcing

Every load-bearing claim in the deck cites one of three sources:
- **Memory** `opsx-package-extraction-open-questions` — the locked
  decisions slides quote this verbatim and the deck's `notes`
  field on each such slide cites it.
- **Memory** `codex-placement-matches-upstream` — the
  codex-global-path bullet on the bin slide cites this.
- **This repo's archives** at
  `openspec/changes/archive/RAD-75634/single-source-opsx-templates/`
  and `.../tool-agnostic-opsx-templates/` — the close slide links
  to both.

No deck slide invents a claim or projects a number — every figure
either is a structural fact (e.g., "11 canonical templates") or is
absent.

### 6. The `opsx init` diff slide

The most pedagogically interesting slide uses the existing `diff`
content variant to show before/after of a fresh consumer repo:
- **before**: an empty repo (no `openspec/`, no
  `.claude/commands/opsx/`, no `openspec/config.yaml`).
- **after**: the same repo after `npx opsx init` — `openspec/`
  scaffold, per-tool command directories populated, commented-out
  `openspec/config.yaml` stub written.

This is the same dialectical pattern as `mitigation-tool-agnostic-affordances`
in the research deck (locked decision #2 in that deck's design).

## Delivery shape

- **PR shape**: one PR. Scope is bounded to one repo (`openspec-llm`).
- **Base branch**: `main`.
- **Repo merge-method**: `squash` (matches existing policy; no
  stacked-PR rebase recipe needed).
- **Named `/opsx:*` invocations per boundary:**
  - propose-end: `/opsx:propose` (this run)
  - capability-start: `/opsx:apply add-package-extraction-deck`
  - capability-end: `/opsx:review` then `/opsx:pr`
  - archive (after merge): `/opsx:archive add-package-extraction-deck`

## Risks / Trade-offs

- **[Risk] The deck claims a future shape that may shift before
  the package actually ships.** Mitigation: every claim cites a
  locked decision from memory; if a decision later reverts, the
  deck's slide that quotes it must be updated in the same change
  that reverts the decision. The memory file is the integrity
  anchor.
- **[Risk] Three-card landing layout regresses on narrow
  viewports.** Mitigation: keep single-column at narrow widths
  (no change from today), expand to three-column at the
  `md:` breakpoint (already a Tailwind responsive default).
  Manual viewport-resize check is part of the verification tasks.
- **[Risk] A new `Theme.name` member could break a switch
  statement somewhere in the renderer that doesn't have a default
  case.** Mitigation: `tsc` will catch any non-exhaustive switch on
  a string-literal union when the union widens. The build is the
  gate.
- **[Trade-off] Cards on the landing page get smaller at three
  abreast.** Accepted — the per-card content stays one short
  paragraph, which fits the narrower column. The summary-link on
  the research card moves to the bottom-right corner as it does
  today (no layout change inside the card).

## Open Questions

- **Should the deck have a one-line "draft" / "preview" badge
  given the package hasn't shipped yet?** Recommendation: no.
  Every claim is anchored; the deck is a pitch, not an
  announcement. A "draft" label would muddy the read.
- **Should we add a summary route eventually?** Recommendation:
  defer. If the deck grows past ~16 slides during authoring, lift
  the bound and add a summary variant in a follow-up change. The
  initial bound (10–14) makes the question moot for v1.

## Decisions made without consultation

- **`ut-teal` chosen as the accent token over `ut-blue` or any
  blend.** Alternative: derive a new token by darkening
  `ut-teal`. Rejected — proposal forbids new brand colors;
  picking among existing palette tokens is the safe move.
- **Landing-page grid extends to `md:grid-cols-3`** rather than
  going to a "primary deck + two below" hierarchy. Rationale: the
  three decks are peers in content authority; the layout should
  reflect that. The alternative (asymmetric hierarchy) would
  imply the workflow deck is the "real" deck — that's not true
  anymore.
- **No density variant for v1.** Alternative: ship the deck with
  full + summary from day one. Rejected — at 10–14 slides the
  summary variant would be ~6 slides and would feel padded.
  Easier to add later if it earns its place.
- **Workflow-card shape (rounded white card with gradient stripe)
  is reused for the third card**, not invented anew. Rationale:
  the research card's "paper" treatment is uniquely a case-study
  signal; reusing it for a forward-looking deck would mis-cue the
  audience. Two pitch-style cards + one case-study card reads
  cleaner than three different card styles.
